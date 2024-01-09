import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { HiChat } from 'react-icons/hi';
import { HiArrowLeftOnRectangle, HiUsers } from 'react-icons/hi2';
import { MdScheduleSend } from "react-icons/md";
import { signOut } from "next-auth/react";
import useConversation from "./useConversation";

const useRoutes = () => {
  const pathname = usePathname();
  const { conversationId } = useConversation();

  const routes = useMemo(() => [
    { 
      label: 'Chat', 
      href: '/conversations', 
      icon: HiChat,
      active: pathname === '/conversations' || !!conversationId
    },
    { 
      label: 'Users', 
      href: '/users', 
      icon: HiUsers, 
      active: pathname === '/users'
    },
    {
      label: "Scheduler",
      href: "/scheduler",
      icon: MdScheduleSend,
      active: pathname === "/scheduler",
    },
    {
      label: 'Logout', 
      onClick: () =>  signOut({ redirect: false }),
      href: '/',
      icon: HiArrowLeftOnRectangle, 
    }
  ], [pathname, conversationId]);

  return routes;
};

export default useRoutes;
