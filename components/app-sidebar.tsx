import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import Image from 'next/image';
import logo from '@/public/logo.png';
import {
  AppleLogo,
  Cube,
  GearSix,
  SignOut,
  House,
  Receipt,
  Users,
  Panorama
} from '@phosphor-icons/react/dist/ssr';
import { BadgePercent, Tags, TicketPercent } from 'lucide-react';
// import { Users } from '@phosphor-icons/react';

// This is sample data.
const data = {
  versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'],
  navMain: [
    {
      title: 'Getting Started',
      url: '#',
      items: [
        {
          title: 'Home',
          url: '/dashboard',
          icon: <House />
        },
        {
          title: 'Settings',
          url: '/dashboard/settings',
          icon: <GearSix />
        },
        {
          title: 'Orders',
          url: '/dashboard/orders',
          icon: <Receipt />
        },
        {
          title: 'Product Category',
          url: '/dashboard/product-categories',
          icon: <Cube />
        },
        {
          title: 'Products',
          url: '/dashboard/products',
          icon: <Cube />
        },
        {
          title: 'Brands',
          url: '/dashboard/brands',
          icon: <AppleLogo />
        },
        {
          title: 'Tags',
          url: '/dashboard/tags',
          icon: <Tags />
        },
        {
          title: 'Flash Sales',
          url: '/dashboard/flash-sales',
          icon: <BadgePercent />
        },
        {
          title: 'Coupons',
          url: '/dashboard/coupons',
          icon: <TicketPercent />
        },
        {
          title: 'Customers',
          url: '/dashboard/customers',
          icon: <Users />
        },
        {
          title: 'Banner',
          url: '/dashboard/banner',
          icon: <Panorama />
        },
        {
          title: 'Logout',
          url: '/auth/logout',
          icon: <SignOut />
        }
      ]
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Image src={logo} alt="Logo" className="h-30 w-auto object-contain" />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map(item => (
          <SidebarGroup key={item.title}>
            {/* <SidebarGroupLabel>{item.title}</SidebarGroupLabel> */}
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <a href={item.url}>{item.title}</a>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
