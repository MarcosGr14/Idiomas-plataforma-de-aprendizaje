import {access} from 'node:fs/promises';
/** Each caller launches a fresh, isolated profile; never attaches to user tabs. */
export async function browserPath(){
 const path=process.env.CHROME_PATH||'/opt/brave.com/brave/brave';
 try{await access(path);return path}catch{throw new Error('Set CHROME_PATH to a local Chromium/Chrome/Brave executable.');}
}
