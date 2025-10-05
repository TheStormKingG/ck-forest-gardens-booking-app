
import React, { useState, useEffect, useCallback } from 'react';
import { GamificationProfile, User, RankTier, Badge } from '../types';
import { api } from '../services/apiMock';
import { GAMIFICATION_RULES } from '../constants';

const badgeColors: Record<Badge, string> = {
    [Badge.FirstSteps]: 'bg-blue-100 text-blue-800',
    [Badge.WeekendWarrior]: 'bg-indigo-100 text-indigo-800',
    [Badge.CampfireCrew]: 'bg-purple-100 text-purple-800',
    [Badge.Trailblazer]: 'bg-pink-100 text-pink-800',
    [Badge.HypeMaker]: 'bg-green-100 text-green-800',
    [Badge.ViralSpark]: 'bg-yellow-100 text-yellow-800',
    [Badge.Amplifier]: 'bg-red-100 text-red-800'
};

const rankColors: Record<RankTier, string> = {
    [RankTier.Explorer]: 'text-gray-500',
    [RankTier.Ranger]: 'text-green-600',
    [RankTier.Guardian]: 'text-blue-600',
    [RankTier.Legend]: 'text-purple-600',
};

const BadgePill: React.FC<{ badge: Badge }> = ({ badge }) => (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeColors[badge]}`}>{badge}</span>
);


const GamificationPage: React.FC<{ currentUser: User | null }> = ({ currentUser }) => {
    const [leaderboard, setLeaderboard] = useState<GamificationProfile[]>([]);
    const [userProfile, setUserProfile] = useState<GamificationProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const allProfiles = await api.getGamificationData();
        setLeaderboard(allProfiles);

        if (currentUser) {
            const profile = await api.getGamificationProfile(currentUser.email);
            setUserProfile(profile);
        }
        setIsLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getRankInfo = (tier: RankTier) => {
        return GAMIFICATION_RULES.rankTiers.find(t => t.tier === tier);
    };

    if (isLoading) {
        return <div className="text-center">Loading leaderboard...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {currentUser && userProfile && (
                <div className="lg:col-span-1 order-first lg:order-last">
                    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-8">
                        <h2 className="text-2xl font-bold text-center text-green-800 mb-4">Your Progress</h2>
                        <div className="text-center mb-4">
                            <p className="text-5xl font-bold text-green-600">{userProfile.points}</p>
                            <p className="text-gray-500">Points</p>
                        </div>
                        <div className="text-center mb-6">
                            <p className={`text-2xl font-bold ${rankColors[userProfile.rankTier]}`}>{userProfile.rankTier}</p>
                            <p className="text-sm text-gray-600">Reward: {getRankInfo(userProfile.rankTier)?.reward}</p>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">Your Badges:</h3>
                        <div className="flex flex-wrap gap-2">
                            {userProfile.badges.length > 0 ? (
                                userProfile.badges.map(badge => <BadgePill key={badge} badge={badge} />)
                            ) : (
                                <p className="text-sm text-gray-500">No badges earned yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="lg:col-span-2">
                <h1 className="text-4xl font-bold text-green-900 mb-6">Leaderboard</h1>
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {leaderboard.map((profile, index) => (
                            <li key={profile.userEmail} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center space-x-4">
                                    <span className="text-lg font-bold text-gray-500 w-8 text-center">{index + 1}</span>
                                    <div>
                                        <p className="font-semibold text-gray-900">{profile.userEmail}</p>
                                        <p className={`text-sm font-bold ${rankColors[profile.rankTier]}`}>{profile.rankTier}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-green-700">{profile.points} pts</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GamificationPage;
