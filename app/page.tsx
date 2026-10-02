import { getChatGPTUser } from "./chatgpt-auth";
import Portal from "./portal";
export const dynamic="force-dynamic";
export default async function Page(){const user=await getChatGPTUser();return <Portal user={user?{name:user.displayName,email:user.email}:{name:"Visiteur",email:""}}/>}
