
import { RiHome3Line } from "react-icons/ri";
import { TbChecklist } from "react-icons/tb";
import { LiaPiggyBankSolid } from "react-icons/lia";
import { FaChartSimple } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";

export const navItems = [
    { name: 'HOME', path: '/home', Icon: RiHome3Line },
    { name: 'EXPENSES', path: '/expenses', Icon: TbChecklist },
    { name: 'SAVINGS', path: '/savings', Icon: LiaPiggyBankSolid },
    { name: 'SUMMARY', path: '/summary', Icon: FaChartSimple },
    { name: 'PROFILE', path: '/profile', Icon: CgProfile }
];
