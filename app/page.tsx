import { requireLocalUser } from "./local-auth";
import Portal from "./portal";
export const dynamic="force-dynamic";
export default async function Page(){const user=await requireLocalUser();return <Portal user={{name:user.displayName,email:user.email,role:user.role}}/>}
