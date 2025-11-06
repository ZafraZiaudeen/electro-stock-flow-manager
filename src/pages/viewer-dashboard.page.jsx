import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Info, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  User,
  Mail,
  BadgeCheck
} from "lucide-react";
import { toast } from "sonner";
import { useRequestUpgradeMutation } from "../lib/api";

export default function ViewerDashboard() {
  const { user } = useUser();
  const [requestUpgrade, { isLoading: isRequesting }] = useRequestUpgradeMutation();
  const upgradeRequest = user?.publicMetadata?.upgradeRequest;

  const handleRequestUpgrade = async () => {
    try {
      const response = await requestUpgrade().unwrap();
      if (response.success) {
        toast.success('Upgrade request submitted successfully!');
        // Reload user to get updated metadata
        window.location.reload();
      }
    } catch (error) {
      console.error('Error requesting upgrade:', error);
      toast.error(error?.data?.error || 'Failed to submit upgrade request');
    }
  };

  const warehouseFeatures = [
    { icon: Package, label: "Manage Inventory", description: "Opening Stock & All Items" },
    { icon: ShieldCheck, label: "Purchase Entries", description: "Create and track purchases" },
    { icon: CheckCircle, label: "GRN Management", description: "Goods Receipt Notes" },
    { icon: Sparkles, label: "Issue Items", description: "Issue to projects" },
    { icon: ArrowRight, label: "Returns Management", description: "Handle item returns" },
    { icon: BadgeCheck, label: "Project Management", description: "Manage all projects" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 md:p-12 mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex aspect-square size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-lg">
                <Package className="size-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Welcome, {user?.firstName || 'Viewer'}!
                </h1>
                <p className="text-blue-100 text-lg">Unlock full warehouse capabilities</p>
              </div>
            </div>
            
            {upgradeRequest?.status === 'pending' && (
              <Alert className="bg-white/95 backdrop-blur-sm border-white/50 shadow-xl">
                <Clock className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-slate-700 font-medium">
                  🎉 Your upgrade request is under review! We'll notify you once an admin approves your access.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Main Request Card */}
          <div className="md:col-span-2">
            {upgradeRequest?.status !== 'pending' && (
              <Card className="border-2 border-blue-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-transparent rounded-full blur-3xl opacity-50" />
                
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    Request Warehouse Staff Access
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Elevate your role to gain full access to warehouse operations including inventory management, 
                    purchase entries, GRN management, and more.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative space-y-6">
                  {/* Current Access */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Your Current Access
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      View Dashboard (Read-only)
                    </div>
                  </div>
                  
                  {/* Warehouse Features Grid */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      Warehouse Staff Capabilities
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {warehouseFeatures.map((feature, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                            <feature.icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-slate-700">{feature.label}</div>
                            <div className="text-xs text-slate-500">{feature.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleRequestUpgrade} 
                    disabled={isRequesting}
                    className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isRequesting ? (
                      <>
                        <Clock className="mr-2 h-5 w-5 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        Request Warehouse Staff Access
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {upgradeRequest?.status === 'pending' && (
              <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl text-blue-700">
                    <Clock className="h-6 w-6 animate-pulse" />
                    Request Pending
                  </CardTitle>
                  <CardDescription className="text-base">
                    Your upgrade request is currently being reviewed by an administrator.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-5 rounded-xl border border-blue-200">
                    <h3 className="font-semibold text-slate-700 mb-3">What happens next?</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>An admin will review your request</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>You'll receive a notification once approved</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>Your role will be automatically upgraded</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      Requested on: {new Date(upgradeRequest.requestedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Account Info Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow border-slate-200">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-600" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-1">Name</div>
                      <div className="font-semibold text-slate-700">
                        {user?.firstName} {user?.lastName}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-1">Email</div>
                      <div className="font-semibold text-slate-700 break-all">
                        {user?.primaryEmailAddress?.emailAddress}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-1">Current Role</div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
                        <span className="font-semibold text-slate-700 capitalize text-sm">
                          {user?.publicMetadata?.role || 'Viewer'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                  <Info className="h-5 w-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed">
                  If you have any questions about the upgrade process or need immediate access, 
                  please contact your system administrator.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}