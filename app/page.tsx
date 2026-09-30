import { requireChatGPTUser } from "./chatgpt-auth";
import Portal from "./portal";
export const dynamic="force-dynamic";
export default async function Page(){const user=await requireChatGPTUser("/");return <Portal user={{name:user.displayName,email:user.email}}/>}
