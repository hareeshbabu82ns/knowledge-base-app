// import {
//   IconAperture, IconCopy, IconLayoutDashboard, IconLogin, IconMoodHappy, IconTypography, IconUserPlus
// } from '@tabler/icons';
import {
  TypeSpecimenOutlined as IconAperture,
  PagesOutlined as IconPage,
  CopyAllOutlined as IconCopy,
  HomeOutlined as DashboardIcon,
  IcecreamOutlined as IconMoodHappy,
  CurrencyRupeeOutlined as TransactionsIcon,
  AccountBalanceWalletOutlined as AccountsIcon,
  PointOfSaleOutlined as OverviewIcon,
  AdminPanelSettingsOutlined as AdminIcon,
  ColorLensOutlined as ThemeIcon,
} from '@mui/icons-material';

import { uniqueId } from 'lodash';

const Menuitems = [
  {
    navlabel: true,
    subheader: 'Home',
  },
  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: DashboardIcon,
    href: '/dashboard',
  },

  ///////// Expenses ///////////
  {
    navlabel: true,
    subheader: 'Expenses',
  },
  {
    id: uniqueId(),
    title: 'Transactions',
    icon: TransactionsIcon,
    href: '/expenses/transactions',
  },
  {
    id: uniqueId(),
    title: 'Accounts',
    icon: AccountsIcon,
    href: '/expenses/accounts',
  },
  {
    id: uniqueId(),
    title: 'Overview',
    icon: OverviewIcon,
    href: '/expenses/overview',
  },

  ///////// Admin ///////////
  {
    navlabel: true,
    subheader: 'Admin',
  },
  {
    id: uniqueId(),
    title: 'Settings',
    icon: AdminIcon,
    href: '/admin/settings',
  },
  {
    id: uniqueId(),
    title: 'Theme',
    icon: ThemeIcon,
    href: '/admin/theme',
  },

  ///////// Utilities ///////////
  {
    navlabel: true,
    subheader: 'Utilities',
  },
  {
    id: uniqueId(),
    title: 'Typography',
    icon: IconAperture,
    href: '/ui/typography',
  },
  {
    id: uniqueId(),
    title: 'Shadow',
    icon: IconCopy,
    href: '/ui/shadow',
  },

  ///////// Extra ///////////
  {
    navlabel: true,
    subheader: 'Extra',
  },
  {
    id: uniqueId(),
    title: 'Icons',
    icon: IconMoodHappy,
    href: '/icons',
  },
  {
    id: uniqueId(),
    title: 'Sample Page',
    icon: IconPage,
    href: '/sample-page',
  },
];

export default Menuitems;
