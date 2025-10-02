import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    user_type: 'customer' | 'rider' | 'admin';
    phone?: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    rating: number;
    total_ratings: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    rider_profile?: RiderProfile;
}

export interface RiderProfile {
    id: number;
    user_id: number;
    vehicle_type: string;
    vehicle_make?: string;
    vehicle_model?: string;
    vehicle_plate?: string;
    verification_status: 'pending' | 'verified' | 'rejected';
    is_online: boolean;
    current_latitude?: number;
    current_longitude?: number;
    delivery_radius: number;
    earnings_today: number;
    total_earnings: number;
}
