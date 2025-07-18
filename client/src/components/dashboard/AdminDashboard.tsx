import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign, BarChart3 } from 'lucide-react';
import { User, FundTransaction, Statistics } from '@/types';
import { StatsCards } from './StatsCards';
import { BordersTab } from './BordersTab';
import { FundsTab } from './FundsTab';
import { ReportsTab } from './ReportsTab';
import { getBorders, getFundTransactions } from '@/services/firestore';

interface AdminDashboardProps {
  userProfile: User;
  onViewProfile: (border: User) => void;
  onAddTransaction: () => void;
  onEditTransaction: (transaction: FundTransaction) => void;
}

export const AdminDashboard = ({ 
  userProfile, 
  onViewProfile, 
  onAddTransaction, 
  onEditTransaction 
}: AdminDashboardProps) => {
  const [stats, setStats] = useState<Statistics>({
    totalBorders: 0,
    currentBalance: 0,
    outstandingDues: 0,
    totalFines: 0,
    totalIncome: 0,
    totalExpense: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [borders, transactions] = await Promise.all([
          getBorders(),
          getFundTransactions()
        ]);

        const totalIncome = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const currentBalance = totalIncome - totalExpense;

        // Calculate outstanding dues and fines (mock values for now)
        const outstandingDues = borders.length * 200; // Example calculation
        const totalFines = borders.reduce((sum, border) => {
          return sum + (border.fines?.reduce((fineSum, fine) => fineSum + fine.amount, 0) || 0);
        }, 0);

        setStats({
          totalBorders: borders.length,
          currentBalance,
          outstandingDues,
          totalFines,
          totalIncome,
          totalExpense,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Dashboard Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-inter font-bold text-3xl text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {userProfile.name}!</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Login</p>
              <p className="font-medium text-gray-700">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <StatsCards stats={stats} />

      {/* Action Tabs */}
      <Card>
        <Tabs defaultValue="borders" className="w-full">
          <div className="border-b border-gray-200 px-6">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="borders" 
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Borders
              </TabsTrigger>
              <TabsTrigger 
                value="funds"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4"
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Fund Management
              </TabsTrigger>
              <TabsTrigger 
                value="reports"
                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="borders" className="mt-0">
            <BordersTab onViewProfile={onViewProfile} />
          </TabsContent>

          <TabsContent value="funds" className="mt-0">
            <FundsTab 
              onAddTransaction={onAddTransaction}
              onEditTransaction={onEditTransaction}
              stats={stats}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <ReportsTab stats={stats} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
