#!/usr/bin/env python3
"""Codex Project Reporter: hook Stop + CLI de prueba, solo stdlib."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

MARKER = re.compile(r"^\s*CPR_PHASE_COMPLETE:\s*(.{1,120})\s*$", re.MULTILINE)
MAX_MSG = 3800

def git(root: Path, *args: str) -> str:
    try:
        p = subprocess.run(["git", "-C", str(root), *args], text=True,
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                           timeout=15, check=False)
        return p.stdout.strip() if p.returncode == 0 else ""
    except (OSError, subprocess.TimeoutExpired):
        return ""

def load_config(root: Path) -> dict:
    path = root / ".codex-project-reporter.json"
    if not path.exists():
        raise RuntimeError(f"No existe {path.name}")
    cfg = json.loads(path.read_text(encoding="utf-8"))
    return cfg

def telegram_send(token: str, chat_id: str, message: str, timeout: int = 15) -> None:
    if not token or not chat_id:
        raise RuntimeError("Falta CPR_TELEGRAM_BOT_TOKEN o telegram_chat_id.")
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    data = urllib.parse.urlencode({
        "chat_id": chat_id,
        "text": message[:4096],
        "disable_web_page_preview": "true",
    }).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            payload = json.loads(response.read().decode("utf-8"))
            if response.status != 200 or not payload.get("ok"):
                raise RuntimeError("Telegram API no confirmó el envío.")
    except urllib.error.HTTPError as e:
        # Do not print URL: it contains the bot token.
        raise RuntimeError(f"Telegram respondió HTTP {e.code}. Revisa chat_id, token y permisos.") from None
    except urllib.error.URLError as e:
        raise RuntimeError(f"No se pudo conectar con Telegram: {e.reason}") from None

def run_verification(root: Path, commands) -> list[tuple[str, int, str]]:
    results = []
    for command in commands:
        if not isinstance(command, list) or not command or not all(isinstance(x, str) for x in command):
            results.append(("<configuración inválida>", 2, "Cada comando debe ser una lista de argumentos."))
            continue
        try:
            p = subprocess.run(command, cwd=root, text=True, stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT, timeout=300, check=False)
            output = p.stdout.strip()
            results.append((" ".join(command), p.returncode, output[-1600:]))
        except subprocess.TimeoutExpired:
            results.append((" ".join(command), 124, "Tiempo máximo de ejecución: 300 s."))
        except OSError as e:
            results.append((" ".join(command), 127, str(e)))
    return results

def make_report(root: Path, event: dict, phase: str, summary: str, cfg: dict) -> tuple[str, str]:
    now = datetime.now().astimezone()
    stamp = now.strftime("%Y%m%d-%H%M%S")
    session = str(event.get("session_id", "manual"))
    turn = str(event.get("turn_id", "unknown"))
    changed = git(root, "status", "--short")
    diffstat = git(root, "diff", "--stat")
    staged = git(root, "diff", "--cached", "--stat")
    branch = git(root, "branch", "--show-current") or "(sin rama o Git no disponible)"
    commit = git(root, "rev-parse", "--short", "HEAD") or "(sin commit)"
    tests = run_verification(root, cfg.get("verification_commands", []))
    if tests:
        test_lines = []
        for cmd, code, output in tests:
            test_lines.append(f"- {'OK' if code == 0 else 'FALLO'} (código {code}): `{cmd}`")
            if output:
                test_lines.append("  Salida final: " + output.replace("\n", "\n  ")[:900])
        test_block = "\n".join(test_lines)
        test_status = "APROBADAS" if all(code == 0 for _, code, _ in tests) else "HAY FALLOS"
    else:
        test_block = "- No se configuraron comandos de verificación; no se ejecutaron pruebas automáticamente."
        test_status = "NO EJECUTADAS"
    safe_summary = summary.strip() or "(Codex no proporcionó resumen textual.)"
    report = f"""# Cierre de fase: {phase}

- Fecha: {now.isoformat(timespec='seconds')}
- Proyecto: {cfg.get('project_name', root.name)}
- Rama: {branch}
- HEAD: {commit}
- Estado de verificación: {test_status}

## Resumen de Codex

{safe_summary}

## Cambios Git observados

### `git status --short`
```text
{changed or "(sin cambios detectados)"}
```

### `git diff --stat`
```text
{diffstat or "(sin cambios no preparados detectados)"}
```

### `git diff --cached --stat`
```text
{staged or "(sin cambios preparados detectados)"}
```

## Verificaciones
{test_block}

## Siguiente paso
La siguiente fase queda pendiente de autorización explícita del usuario.
"""
    out_dir = root / cfg.get("report_directory", "docs/progress")
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"{stamp}-{slug(phase)}.md"
    path.write_text(report, encoding="utf-8")
    telegram = (
        f"🧩 {cfg.get('project_name', root.name)} — fase cerrada\n"
        f"Fase: {phase}\n"
        f"Verificación: {test_status}\n\n"
        f"Resumen:\n{shorten(safe_summary, 1250)}\n\n"
        f"Git: rama {branch}, HEAD {commit}\n"
        f"Cambios: {shorten(changed or 'ninguno detectado', 500)}\n\n"
        f"Informe local: {path.relative_to(root)}\n"
        "Siguiente fase: pendiente de tu autorización."
    )
    return str(path), telegram

def slug(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9_-]+", "-", text.strip().lower()).strip("-")
    return (s[:60] or "fase")

def shorten(text: str, limit: int) -> str:
    return text if len(text) <= limit else text[:limit-1].rstrip() + "…"

def find_root(cwd: str) -> Path:
    p = Path(cwd).resolve()
    try:
        out = subprocess.run(["git", "-C", str(p), "rev-parse", "--show-toplevel"],
                             text=True, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                             check=True, timeout=5).stdout.strip()
        return Path(out).resolve()
    except Exception:
        return p

def process_event(event: dict) -> int:
    root = find_root(str(event.get("cwd") or os.getcwd()))
    message = event.get("last_assistant_message") or ""
    match = MARKER.search(message)
    if not match:
        return 0
    phase = match.group(1).strip()
    summary = MARKER.sub("", message).strip()
    try:
        cfg = load_config(root)
        token = os.environ.get("CPR_TELEGRAM_BOT_TOKEN", "")
        chat_id = str(cfg.get("telegram_chat_id", "")).strip()
        if not token or not chat_id:
            log_error(root, "Fase marcada, pero falta token o telegram_chat_id; informe local no generado.")
            return 0
        key = hashlib.sha256((str(event.get("session_id")) + "|" + str(event.get("turn_id")) + "|" + phase + "|" + message).encode()).hexdigest()
        state_path = root / ".codex-project-reporter-state.json"
        try:
            state = json.loads(state_path.read_text(encoding="utf-8")) if state_path.exists() else {}
        except (OSError, json.JSONDecodeError):
            state = {}
        if state.get("last_key") == key:
            return 0
        path, telegram = make_report(root, event, phase, summary, cfg)
        telegram_send(token, chat_id, shorten(telegram, int(cfg.get("max_telegram_chars", MAX_MSG))))
        state_path.write_text(json.dumps({"last_key": key, "last_report": path}, indent=2), encoding="utf-8")
        return 0
    except Exception as exc:
        log_error(root, f"Error al generar/enviar informe: {exc}")
        return 0

def log_error(root: Path, text: str) -> None:
    try:
        log = root / ".codex-project-reporter.log"
        with log.open("a", encoding="utf-8") as f:
            f.write(f"{datetime.now().astimezone().isoformat(timespec='seconds')} {text}\n")
    except OSError:
        pass

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--test-telegram", action="store_true")
    args = parser.parse_args()
    if args.test_telegram:
        root = find_root(os.getcwd())
        try:
            cfg = load_config(root)
            telegram_send(os.environ.get("CPR_TELEGRAM_BOT_TOKEN", ""),
                          str(cfg.get("telegram_chat_id", "")).strip(),
                          f"✅ Prueba de Codex Project Reporter: conexión con Telegram correcta para {cfg.get('project_name', root.name)}.")
            print("Telegram confirmó el envío.")
            return 0
        except Exception as exc:
            print(f"Error: {exc}", file=sys.stderr)
            return 1
    try:
        event = json.load(sys.stdin)
    except Exception:
        return 0
    return process_event(event)

if __name__ == "__main__":
    raise SystemExit(main())
