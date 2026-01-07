'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserBar from '@/components/UserBar';
import { supabase, signOutCompletely, getValidAccessToken } from '@/lib/supabase';
import { VENUE_OPTIONS } from '@/lib/constants';

interface AdminProposal {
    id: string;
    event_name: string;
    held_by: string;
    collaborating_cc?: string | null;
    type: string;
    status: string;
    description: string | null;
    // Dynamic fields
    competition_structure?: string | null;
    competition_rules?: string | null;
    judgement_criteria?: string | null;
    faqs?: string | null;
    team_size?: string | null;
    workshop_outcome?: string | null;
    workshop_type?: string | null;
    speaker_name?: string | null;

    duration: {
        start_date: string;
        end_date: string;
        start_time: string;
        end_time: string;
        is_overnight: boolean;
    };
    capacity: number;
    preferred_venue: string;
    poc: {
        name: string;
        reg_no: string;
        contact: string;
    };
    financials: {
        expected_sponsorship: number;
        expected_prize_money: number | null;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [proposals, setProposals] = useState<AdminProposal[]>([]);
    const [error, setError] = useState('');

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedClub, setSelectedClub] = useState('all');
    const [selectedOvernight, setSelectedOvernight] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [startDateFilter, setStartDateFilter] = useState('');

    // Sorting State
    const [sortField, setSortField] = useState<'date' | 'capacity' | 'name'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // Expanded Rows State
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // Status Update State
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.user) {
                    setLoading(false);
                    router.push('/');
                    return;
                }

                const email = session.user.email || '';

                // Check admin status via Backend API
                const accessToken = await getValidAccessToken();
                const adminCheck = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal/admin/status`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                });
                const adminData = await adminCheck.json();

                if (!adminData.isAdmin) {
                    setError('Access denied. Authorized personnel only.');
                    setLoading(false);
                    setTimeout(() => router.push('/'), 3000);
                    return;
                }

                setUser(session.user);
                await fetchProposals();
            } catch (error) {
                console.error('Auth check error:', error);
                setError('Authentication error. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session?.user) {
                router.push('/');
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const fetchProposals = async () => {
        try {
            const accessToken = await getValidAccessToken();

            if (!accessToken) {
                setError('Session expired. Please sign in again.');
                setTimeout(async () => {
                    await signOutCompletely();
                    router.push('/');
                }, 2000);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal/admin/all-submissions`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setProposals(data.data);
                setError('');
            } else {
                setError(data.message || 'Failed to fetch proposals');
            }
        } catch (error) {
            console.error('Fetch proposals error:', error);
            setError('Network error. Please ensure the backend server is running.');
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            setUpdatingStatus(id);
            const accessToken = await getValidAccessToken();

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal/admin/proposal/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setProposals(prev => prev.map(p =>
                    p.id === id ? { ...p, status: newStatus } : p
                ));
            } else {
                console.error('Failed to update status');
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleSignOut = async () => {
        await signOutCompletely();
        router.push('/');
    };

    const getEventTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            'tech_competition': 'Tech Competition',
            'hackathon': 'Hackathon',
            'workshop': 'Workshop',
            'tech_talk': 'Tech Talk'
        };
        return labels[type] || type;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'under_consideration': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'under_consideration': return 'Under Consideration';
            default: return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Derived Data: Unique Clubs for Dropdown
    const uniqueClubs = useMemo(() => {
        const clubs = new Set(proposals.map(p => p.held_by));
        return Array.from(clubs).sort();
    }, [proposals]);

    // Filtering Logic
    const filteredProposals = useMemo(() => {
        return proposals.filter(proposal => {
            // Search Query
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                proposal.event_name.toLowerCase().includes(searchLower) ||
                proposal.held_by.toLowerCase().includes(searchLower);

            // Type Filter
            const matchesType = selectedType === 'all' || proposal.type === selectedType;

            // Club Filter
            const matchesClub = selectedClub === 'all' || proposal.held_by === selectedClub;

            // Overnight Filter
            const matchesOvernight =
                selectedOvernight === 'all' ||
                (selectedOvernight === 'yes' && proposal.duration.is_overnight) ||
                (selectedOvernight === 'no' && !proposal.duration.is_overnight);

            // Status Filter
            const matchesStatus = selectedStatus === 'all' || proposal.status === selectedStatus;

            // Date Filter
            const matchesDate = !startDateFilter || proposal.duration.start_date === startDateFilter;

            return matchesSearch && matchesType && matchesClub && matchesOvernight && matchesDate && matchesStatus;
        });
    }, [proposals, searchQuery, selectedType, selectedClub, selectedOvernight, selectedStatus, startDateFilter]);

    // Sorting Logic
    const sortedProposals = useMemo(() => {
        return [...filteredProposals].sort((a, b) => {
            let comparison = 0;
            if (sortField === 'date') {
                comparison = new Date(a.duration.start_date).getTime() - new Date(b.duration.start_date).getTime();
            } else if (sortField === 'capacity') {
                comparison = a.capacity - b.capacity;
            } else if (sortField === 'name') {
                comparison = a.event_name.localeCompare(b.event_name);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredProposals, sortField, sortDirection]);

    // Stats Logic
    const stats = useMemo(() => {
        const total = filteredProposals.length;
        const totalCapacity = filteredProposals.reduce((sum, p) => sum + p.capacity, 0);
        const overnightCount = filteredProposals.filter(p => p.duration.is_overnight).length;
        return { total, totalCapacity, overnightCount };
    }, [filteredProposals]);

    // Toggle Row Expansion
    const toggleRow = (index: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedRows(newExpanded);
    };

    // Logistics Edit State
    const [editingLogistics, setEditingLogistics] = useState<{ [key: string]: boolean }>({});
    const [logisticsChanges, setLogisticsChanges] = useState<{
        [key: string]: {
            start_date?: string;
            start_time?: string;
            end_date?: string;
            end_time?: string;
            venue?: string;
        }
    }>({});

    const handleLogisticsChange = (id: string, field: string, value: string) => {
        setLogisticsChanges(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }));
    };

    const handleSaveLogistics = async (id: string) => {
        const changes = logisticsChanges[id];
        if (!changes) {
            setEditingLogistics(prev => {
                const newPrev = { ...prev };
                delete newPrev[id];
                return newPrev;
            });
            return;
        }

        const proposal = proposals.find(p => p.id === id);
        if (!proposal) return;

        // Construct new values (use changed value or fallback to original)
        const newStartDate = changes.start_date || proposal.duration.start_date;
        const newStartTime = changes.start_time || proposal.duration.start_time;
        const newEndDate = changes.end_date || proposal.duration.end_date;
        const newEndTime = changes.end_time || proposal.duration.end_time;
        const newVenue = changes.venue || proposal.preferred_venue;
        // Validate Date/Time Logic
        const startDateTime = new Date(`${newStartDate}T${newStartTime}`);
        const endDateTime = new Date(`${newEndDate}T${newEndTime}`);

        // Event dates: 07-02-2026 to 15-02-2026
        const minDate = new Date(2026, 1, 7); // February 7, 2026
        const maxDate = new Date(2026, 1, 15, 23, 59, 59); // February 15, 2026

        const startDateObj = new Date(newStartDate);
        const endDateObj = new Date(newEndDate);

        // Check if start date is within range
        if (startDateObj < minDate || startDateObj > maxDate) {
            alert('Error: Event start date must be between Feb 7, 2026 and Feb 15, 2026.');
            return;
        }

        // Check if end date is within range
        if (endDateObj < minDate || endDateObj > maxDate) {
            alert('Error: Event end date must be between Feb 7, 2026 and Feb 15, 2026.');
            return;
        }

        if (startDateTime >= endDateTime) {
            alert('Error: End date/time must be after start date/time.');
            return;
        }

        // Confirmation Popup
        if (!window.confirm('Are you sure you want to update the logistics for this event? This action cannot be undone.')) {
            return;
        }

        try {
            const accessToken = await getValidAccessToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal/admin/proposal/${id}/logistics`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_start_date: newStartDate,
                    event_start_time: newStartTime,
                    event_end_date: newEndDate,
                    event_end_time: newEndTime,
                    preferred_venue: newVenue
                })
            });

            if (response.ok) {
                // Update local state
                setProposals(prev => prev.map(p => {
                    if (p.id === id) {
                        return {
                            ...p,
                            preferred_venue: newVenue,
                            duration: {
                                ...p.duration,
                                start_date: newStartDate,
                                start_time: newStartTime,
                                end_date: newEndDate,
                                end_time: newEndTime
                            }
                        };
                    }
                    return p;
                }));

                // Clear edit state
                setEditingLogistics(prev => {
                    const newPrev = { ...prev };
                    delete newPrev[id];
                    return newPrev;
                });
                setLogisticsChanges(prev => {
                    const newPrev = { ...prev };
                    delete newPrev[id];
                    return newPrev;
                });

                alert('Logistics updated successfully!');
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to update logistics');
            }
        } catch (error) {
            console.error('Error updating logistics:', error);
            alert('An error occurred while updating logistics');
        }
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Event Name', 'Club/Chapter', 'Collaborating Club', 'Type', 'Status', 'Start Date', 'End Date', 'Capacity', 'Overnight', 'Venue', 'Description', 'POC Name', 'POC Reg No', 'POC Contact', 'Expected Sponsorship', 'Expected Prize Money'];
        const csvContent = [
            headers.join(','),
            ...sortedProposals.map(p => [
                `"${p.event_name.replace(/"/g, '""')}"`,
                `"${p.held_by.replace(/"/g, '""')}"`,
                `"${(p.collaborating_cc || '').replace(/"/g, '""')}"`,
                p.type,
                p.status,
                p.duration.start_date,
                p.duration.end_date,
                p.capacity,
                p.duration.is_overnight ? 'Yes' : 'No',
                `"${p.preferred_venue.replace(/"/g, '""')}"`,
                `"${(p.description || '').replace(/"/g, '""')}"`,
                `"${p.poc.name.replace(/"/g, '""')}"`,
                `"${p.poc.reg_no.replace(/"/g, '""')}"`,
                `"${p.poc.contact.replace(/"/g, '""')}"`,
                p.financials.expected_sponsorship,
                p.financials.expected_prize_money !== null ? p.financials.expected_prize_money : ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'yantra_submissions.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedType('all');
        setSelectedClub('all');
        setSelectedOvernight('all');
        setSelectedStatus('all');
        setStartDateFilter('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black"></div>
                    <p className="mt-4 text-lg font-bold uppercase tracking-wider">Loading...</p>
                </div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center p-6 border-2 border-red-600 bg-red-50 max-w-md">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
                    <p className="text-red-700">{error}</p>
                    <button onClick={() => router.push('/')} className="mt-4 bg-red-800 text-white px-4 py-2 text-sm font-bold uppercase hover:bg-red-900">
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />
            {user && <UserBar email={user.email || ''} onSignOut={handleSignOut} />}

            <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Top Bar */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider">Admin Dashboard</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage and review all event proposals</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={exportToCSV} className="bg-black text-white px-4 py-2 text-sm font-bold uppercase hover:bg-gray-800 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export CSV
                            </button>
                            <button onClick={() => router.push('/')} className="bg-white text-black border-2 border-black px-4 py-2 text-sm font-bold uppercase hover:bg-gray-100 transition-colors">
                                Back to Home
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-black text-white p-4 border-2 border-black">
                            <p className="text-xs font-bold uppercase opacity-70">Total Submissions</p>
                            <p className="text-3xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-white text-black p-4 border-2 border-black">
                            <p className="text-xs font-bold uppercase text-gray-500">Total Capacity</p>
                            <p className="text-3xl font-bold">{stats.totalCapacity}</p>
                        </div>
                        <div className="bg-white text-black p-4 border-2 border-black">
                            <p className="text-xs font-bold uppercase text-gray-500">Overnight Events</p>
                            <p className="text-3xl font-bold">{stats.overnightCount}</p>
                        </div>
                    </div>

                    {/* Filters & Toolbar */}
                    <div className="bg-gray-50 border-2 border-black p-4 mb-8">
                        <div className="flex flex-col gap-4">
                            {/* Row 1: Search and Sort */}
                            <div className="flex flex-col md:flex-row gap-4 justify-between">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Search</label>
                                    <input
                                        type="text"
                                        placeholder="Search by Event Name or Club..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full border-2 border-gray-300 p-2 text-sm focus:border-black focus:outline-none"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Sort By</label>
                                        <select
                                            value={sortField}
                                            onChange={(e) => setSortField(e.target.value as any)}
                                            className="border-2 border-gray-300 p-2 text-sm focus:border-black focus:outline-none bg-white"
                                        >
                                            <option value="date">Date</option>
                                            <option value="capacity">Capacity</option>
                                            <option value="name">Name</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Order</label>
                                        <button
                                            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                            className="border-2 border-gray-300 p-2 text-sm hover:border-black bg-white w-full text-left flex items-center justify-between gap-2"
                                        >
                                            {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                                            <span className="text-xs">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Filters */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Event Type</label>
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full border-2 border-gray-300 p-2 text-sm focus:border-black focus:outline-none bg-white"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="tech_competition">Tech Competition</option>
                                        <option value="hackathon">Hackathon</option>
                                        <option value="workshop">Workshop</option>
                                        <option value="tech_talk">Tech Talk</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Club/Chapter</label>
                                    <select
                                        value={selectedClub}
                                        onChange={(e) => setSelectedClub(e.target.value)}
                                        className="w-full border-2 border-gray-300 p-2 text-sm focus:border-black focus:outline-none bg-white"
                                    >
                                        <option value="all">All Clubs</option>
                                        {uniqueClubs.map(club => (
                                            <option key={club} value={club}>{club}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Status</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full border-2 border-gray-300 p-2 text-sm focus:border-black focus:outline-none bg-white"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="under_consideration">Under Consideration</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDateFilter}
                                        onChange={(e) => setStartDateFilter(e.target.value)}
                                        className="w-full border-2 border-gray-300 p-2 text-sm focus:border-black focus:outline-none bg-white"
                                    />
                                </div>
                            </div>

                            {/* Row 3: Actions */}
                            <div className="flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold uppercase text-red-600 hover:text-red-800 underline"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Data List */}
                    {sortedProposals.length === 0 ? (
                        <div className="text-center py-12 border-2 border-black bg-white">
                            <p className="text-lg font-bold uppercase tracking-wide mb-2">No Results Found</p>
                            <p className="text-gray-500 text-sm">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <div className="border-2 border-black bg-white">
                            {/* Table Header (Hidden on mobile, shown on md+) */}
                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-100 border-b-2 border-black font-bold uppercase text-xs tracking-wider text-gray-600">
                                <div className="col-span-4">Event Name / Club</div>
                                <div className="col-span-2">Type</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-1">Capacity</div>
                                <div className="col-span-1 text-right">Action</div>
                            </div>

                            {/* Rows */}
                            {sortedProposals.map((proposal, index) => {
                                const isExpanded = expandedRows.has(index);
                                return (
                                    <div key={index} className="border-b border-gray-200 last:border-b-0">
                                        {/* Summary Row */}
                                        <div
                                            onClick={() => toggleRow(index)}
                                            className={`p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                        >
                                            {/* Mobile: Stacked View */}
                                            <div className="md:col-span-4 flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-sm md:text-base">{proposal.event_name}</h3>
                                                    <p className="text-xs text-gray-500 uppercase">{proposal.held_by}</p>
                                                </div>
                                                {/* Mobile Expand Indicator */}
                                                <span className="md:hidden text-xl font-bold text-gray-400">
                                                    {isExpanded ? '−' : '+'}
                                                </span>
                                            </div>

                                            <div className="md:col-span-2 flex items-center gap-2 md:block">
                                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 w-20">Type:</span>
                                                <span className="text-xs font-bold uppercase bg-black text-white px-2 py-1 inline-block">
                                                    {getEventTypeLabel(proposal.type)}
                                                </span>
                                            </div>

                                            <div className="md:col-span-2 flex items-center gap-2 md:block">
                                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 w-20">Status:</span>
                                                <span className={`text-xs font-bold uppercase px-2 py-1 border ${getStatusColor(proposal.status)}`}>
                                                    {getStatusLabel(proposal.status)}
                                                </span>
                                            </div>

                                            <div className="md:col-span-2 flex items-center gap-2 md:block">
                                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 w-20">Date:</span>
                                                <span className="text-sm font-medium">{formatDate(proposal.duration.start_date)}</span>
                                            </div>

                                            <div className="md:col-span-1 flex items-center gap-2 md:block">
                                                <span className="md:hidden text-xs font-bold uppercase text-gray-500 w-20">Capacity:</span>
                                                <span className="text-sm font-medium">{proposal.capacity}</span>
                                            </div>

                                            <div className="md:col-span-1 text-right hidden md:block">
                                                <span className="text-xl font-bold text-gray-400">
                                                    {isExpanded ? '−' : '+'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Expanded Detail View */}
                                        {isExpanded && (
                                            <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Left Column */}
                                                    <div className="space-y-4">
                                                        {/* Status Actions */}
                                                        <div className="bg-white p-4 border border-black shadow-sm mb-4">
                                                            <h4 className="font-bold uppercase text-xs text-black mb-3">Update Status</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    onClick={() => updateStatus(proposal.id, 'approved')}
                                                                    disabled={updatingStatus === proposal.id || proposal.status === 'approved'}
                                                                    className={`px-3 py-2 text-xs font-bold uppercase transition-colors border-2 ${proposal.status === 'approved'
                                                                        ? 'bg-green-600 text-white border-green-600 cursor-default'
                                                                        : 'bg-white text-green-600 border-green-600 hover:bg-green-50'
                                                                        }`}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStatus(proposal.id, 'under_consideration')}
                                                                    disabled={updatingStatus === proposal.id || proposal.status === 'under_consideration'}
                                                                    className={`px-3 py-2 text-xs font-bold uppercase transition-colors border-2 ${proposal.status === 'under_consideration'
                                                                        ? 'bg-yellow-500 text-white border-yellow-500 cursor-default'
                                                                        : 'bg-white text-yellow-600 border-yellow-500 hover:bg-yellow-50'
                                                                        }`}
                                                                >
                                                                    Under Consideration
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStatus(proposal.id, 'rejected')}
                                                                    disabled={updatingStatus === proposal.id || proposal.status === 'rejected'}
                                                                    className={`px-3 py-2 text-xs font-bold uppercase transition-colors border-2 ${proposal.status === 'rejected'
                                                                        ? 'bg-red-600 text-white border-red-600 cursor-default'
                                                                        : 'bg-white text-red-600 border-red-600 hover:bg-red-50'
                                                                        }`}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <h4 className="font-bold uppercase text-xs text-gray-500 mb-1">Description</h4>
                                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.description || 'N/A'}</p>
                                                        </div>

                                                        {proposal.collaborating_cc && (
                                                            <div>
                                                                <h4 className="font-bold uppercase text-xs text-gray-500 mb-1">Collaborating Club</h4>
                                                                <p className="text-sm font-bold text-blue-800">{proposal.collaborating_cc}</p>
                                                            </div>
                                                        )}

                                                        {/* Dynamic Fields */}
                                                        {(proposal.type === 'tech_competition' || proposal.type === 'hackathon') && (
                                                            <>
                                                                {proposal.competition_structure && (
                                                                    <div>
                                                                        <h4 className="font-bold uppercase text-xs text-gray-500 mb-1">Structure</h4>
                                                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.competition_structure}</p>
                                                                    </div>
                                                                )}
                                                                {proposal.competition_rules && (
                                                                    <div>
                                                                        <h4 className="font-bold uppercase text-xs text-gray-500 mb-1">Rules</h4>
                                                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.competition_rules}</p>
                                                                    </div>
                                                                )}
                                                                {proposal.judgement_criteria && (
                                                                    <div>
                                                                        <h4 className="font-bold uppercase text-xs text-gray-500 mb-1">Judgement Criteria</h4>
                                                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.judgement_criteria}</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}

                                                        {proposal.type === 'workshop' && proposal.workshop_outcome && (
                                                            <div>
                                                                <h4 className="font-bold uppercase text-xs text-gray-500 mb-1">Outcome</h4>
                                                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{proposal.workshop_outcome}</p>
                                                            </div>
                                                        )}

                                                        {proposal.type === 'tech_talk' && proposal.speaker_name && (
                                                            <div>
                                                                <h4 className="font-bold uppercase text-xs text-gray-500 mb-1">Speaker</h4>
                                                                <p className="text-sm text-gray-800">{proposal.speaker_name}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right Column */}
                                                    <div className="space-y-4">
                                                        <div className="bg-white p-4 border border-gray-200">
                                                            <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                                                                <h4 className="font-bold uppercase text-xs text-black">Full Logistics</h4>
                                                                {!editingLogistics[proposal.id] ? (
                                                                    <button
                                                                        onClick={() => setEditingLogistics({ ...editingLogistics, [proposal.id]: true })}
                                                                        className="text-xs font-bold text-blue-600 hover:underline uppercase"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                ) : (
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleSaveLogistics(proposal.id)}
                                                                            className="text-xs font-bold text-green-600 hover:underline uppercase"
                                                                        >
                                                                            Save
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const newEditing = { ...editingLogistics };
                                                                                delete newEditing[proposal.id];
                                                                                setEditingLogistics(newEditing);
                                                                                // Reset changes
                                                                                setLogisticsChanges(prev => {
                                                                                    const newChanges = { ...prev };
                                                                                    delete newChanges[proposal.id];
                                                                                    return newChanges;
                                                                                });
                                                                            }}
                                                                            className="text-xs font-bold text-red-600 hover:underline uppercase"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {editingLogistics[proposal.id] ? (
                                                                <div className="grid grid-cols-1 gap-3 text-sm">
                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 uppercase mb-1">Start Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={logisticsChanges[proposal.id]?.start_date || proposal.duration.start_date}
                                                                            onChange={(e) => handleLogisticsChange(proposal.id, 'start_date', e.target.value)}
                                                                            className="w-full border border-gray-300 p-1 text-sm"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 uppercase mb-1">Start Time</label>
                                                                        <input
                                                                            type="time"
                                                                            value={logisticsChanges[proposal.id]?.start_time || proposal.duration.start_time}
                                                                            onChange={(e) => handleLogisticsChange(proposal.id, 'start_time', e.target.value)}
                                                                            className="w-full border border-gray-300 p-1 text-sm"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 uppercase mb-1">End Date</label>
                                                                        <input
                                                                            type="date"
                                                                            value={logisticsChanges[proposal.id]?.end_date || proposal.duration.end_date}
                                                                            onChange={(e) => handleLogisticsChange(proposal.id, 'end_date', e.target.value)}
                                                                            className="w-full border border-gray-300 p-1 text-sm"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 uppercase mb-1">End Time</label>
                                                                        <input
                                                                            type="time"
                                                                            value={logisticsChanges[proposal.id]?.end_time || proposal.duration.end_time}
                                                                            onChange={(e) => handleLogisticsChange(proposal.id, 'end_time', e.target.value)}
                                                                            className="w-full border border-gray-300 p-1 text-sm"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs text-gray-500 uppercase mb-1">Venue</label>
                                                                        <select
                                                                            value={logisticsChanges[proposal.id]?.venue || proposal.preferred_venue}
                                                                            onChange={(e) => handleLogisticsChange(proposal.id, 'venue', e.target.value)}
                                                                            className="w-full border border-gray-300 p-1 text-sm"
                                                                        >
                                                                            {VENUE_OPTIONS.map(opt => (
                                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 uppercase">Start</p>
                                                                        <p className="font-medium">{formatDate(proposal.duration.start_date)} {proposal.duration.start_time}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 uppercase">End</p>
                                                                        <p className="font-medium">{formatDate(proposal.duration.end_date)} {proposal.duration.end_time}</p>
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <p className="text-xs text-gray-500 uppercase">Venue</p>
                                                                        <p className="font-medium">{proposal.preferred_venue}</p>
                                                                    </div>
                                                                    {proposal.team_size && (
                                                                        <div>
                                                                            <p className="text-xs text-gray-500 uppercase">Team Size</p>
                                                                            <p className="font-medium">{proposal.team_size}</p>
                                                                        </div>
                                                                    )}
                                                                    <div className="col-span-2">
                                                                        <p className="text-xs text-gray-500 uppercase">Overnight</p>
                                                                        <p className={`font-bold ${proposal.duration.is_overnight ? 'text-purple-600' : 'text-gray-600'}`}>
                                                                            {proposal.duration.is_overnight ? 'Yes' : 'No'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* POC Details */}
                                                        <div className="bg-white p-4 border border-gray-200">
                                                            <h4 className="font-bold uppercase text-xs text-black mb-3 border-b border-gray-200 pb-2">Point of Contact</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <p className="text-xs text-gray-500 uppercase">Name</p>
                                                                    <p className="font-medium">{proposal.poc.name}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 uppercase">Registration No.</p>
                                                                    <p className="font-medium">{proposal.poc.reg_no}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-gray-500 uppercase">Contact</p>
                                                                    <p className="font-medium">{proposal.poc.contact}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Financials */}
                                                        <div className="bg-white p-4 border border-gray-200">
                                                            <h4 className="font-bold uppercase text-xs text-black mb-3 border-b border-gray-200 pb-2">Financials</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div>
                                                                    <p className="text-xs text-gray-500 uppercase">Expected Sponsorship</p>
                                                                    <p className="font-medium">₹{proposal.financials.expected_sponsorship}</p>
                                                                </div>
                                                                {proposal.financials.expected_prize_money !== null && (
                                                                    <div>
                                                                        <p className="text-xs text-gray-500 uppercase">Expected Prize Money</p>
                                                                        <p className="font-medium">₹{proposal.financials.expected_prize_money}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
