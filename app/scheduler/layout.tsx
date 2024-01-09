import getCurrentUser from "../actions/getCurrentUser";
import { getMyMessageSchedule } from "../actions/getMessageSchedule";
import getUsers from "../actions/getUsers";
import Scheduler from "./component/Scheduler";

export default async function UsersLayout() {
  const user = await getCurrentUser()
  const scheduledMessages = await getMyMessageSchedule()
  const users = await getUsers();
  return (
      <div className="h-full">
        <Scheduler userName={user?.name} scheduledMessages={scheduledMessages} users={users} />
      </div>
  );
}