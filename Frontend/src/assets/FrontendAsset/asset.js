import { TbNotes, TbWallet, TbUsersGroup } from "react-icons/tb";
import { LiaPiggyBankSolid } from "react-icons/lia";
import { FaChartSimple } from "react-icons/fa6";

export const navItems = [
    { name: 'RECORD', path: '/home', Icon: TbNotes },
    { name: 'BUDGET', path: '/expense', Icon: TbWallet },
    { name: 'SAVINGS', path: '/savings', Icon: LiaPiggyBankSolid },
    { name: 'SUMMARY', path: '/summary', Icon: FaChartSimple },
    { name: 'TEAM', path: '/team', Icon: TbUsersGroup },
];
