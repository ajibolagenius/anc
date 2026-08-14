// Phosphor Icons (https://phosphoricons.com) re-exported under the app's
// original icon names, so every existing call site (`<GiftIcon className="h-4 w-4" />`)
// keeps working unchanged while the app is migrated page-by-page off the old
// hand-drawn SVGs. New code should prefer importing directly from
// "@phosphor-icons/react/ssr" with a real Phosphor name instead of adding to
// this legacy alias list.
//
// The "/ssr" entry point is used everywhere (Server and Client components)
// because it's a plain, hook-free SVG renderer — unlike the default export,
// it never needs a "use client" boundary or an IconContext provider.
export {
  ChatCircleIcon as ChatIcon,
  ArrowRightIcon,
  GiftIcon,
  CalendarBlankIcon as CalendarIcon,
  MapPinIcon,
  CakeIcon,
  BellIcon,
  ShieldCheckIcon as ShieldIcon,
  TrophyIcon,
  UsersThreeIcon as UsersIcon,
  LockIcon,
  GearSixIcon as GearIcon,
  UsersThreeIcon as UsersListIcon,
  EnvelopeSimpleIcon as MailIcon,
  ChartLineUpIcon as ActivityIcon,
  ListIcon as MenuIcon,
  XIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr";
