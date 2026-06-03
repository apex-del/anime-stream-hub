import {
  Home,
  Search,
  Heart,
  Clock,
  Settings,
  LogIn,
  Download,
  TrendingUp,
  Compass,
  Shuffle,
  Trophy,
  MessageSquare,
  CalendarDays,
  Info,
  Bookmark,
  Sparkles,
  Award,
  Building2,
  User,
  Tv,
  Clapperboard,
  Disc,
  Radio,
  Music,
  Star,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Browse", url: "/browse", icon: Compass },
  { title: "Genres", url: "/genres", icon: Search },
  { title: "Top Charts", url: "/top-charts", icon: Trophy },
  { title: "Upcoming", url: "/upcoming", icon: Sparkles },
  { title: "Studios", url: "/studios", icon: Building2 },
  { title: "Leaderboard", url: "/leaderboard", icon: Award },
  { title: "Schedule", url: "/schedule", icon: CalendarDays },
  { title: "Random", url: "/random", icon: Shuffle },
];

const typeNav = [
  { title: "TV Series", url: "/browse?type=tv", icon: Tv },
  { title: "Movies", url: "/browse?type=movie", icon: Clapperboard },
  { title: "OVA", url: "/browse?type=ova", icon: Disc },
  { title: "ONA", url: "/browse?type=ona", icon: Radio },
  { title: "Specials", url: "/browse?type=special", icon: Star },
  { title: "Music", url: "/browse?type=music", icon: Music },
];

const userNav = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Watch List", url: "/watchlist", icon: Bookmark },
  { title: "History", url: "/history", icon: Clock },
  { title: "Settings", url: "/settings", icon: Settings },
];

const extraNav = [
  { title: "Contact", url: "/contact", icon: MessageSquare },
  { title: "About", url: "/about", icon: Info },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Brand */}
      <SidebarHeader className="p-4">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Download className="h-6 w-6 text-sidebar-primary shrink-0" />
            <span className="text-lg font-bold tracking-tight">
              Anime<span className="text-sidebar-primary">Stream</span>
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <Download className="h-6 w-6 text-sidebar-primary" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Discover</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Types */}
        <SidebarGroup>
          <SidebarGroupLabel>Types</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {typeNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname + location.search === item.url}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>



        {/* User Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Extra */}
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {extraNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3">
        {user ? (
          <NavLink
            to="/profile"
            className={`flex items-center gap-3 rounded-lg bg-sidebar-accent p-2.5 hover:bg-sidebar-accent/80 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-sm font-bold">
              {user.email?.[0]?.toUpperCase() || "U"}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {user.email}
                </p>
                <p className="text-[10px] text-muted-foreground">View profile</p>
              </div>
            )}
          </NavLink>
        ) : (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Sign In">
                <NavLink to="/auth">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
