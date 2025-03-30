import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  deleteWaitlistEntry, 
  getAllWaitlistEntries, 
  logoutAdmin, 
  sendPromotionalEmail, 
  sendLaunchAnnouncement 
} from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, Trash, Mail, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { WaitlistEntry } from '@shared/schema';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminDashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isLaunchDialogOpen, setIsLaunchDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['/api/admin/waitlist'],
    queryFn: async () => {
      const res = await getAllWaitlistEntries();
      const data = await res.json();
      return data as WaitlistEntry[];
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteWaitlistEntry(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Entry deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/waitlist'] });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete entry",
        variant: "destructive"
      });
    }
  });
  
  const logoutMutation = useMutation({
    mutationFn: () => logoutAdmin(),
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out"
      });
      setLocation('/');
    }
  });
  
  const sendPromotionalEmailMutation = useMutation({
    mutationFn: (message?: string) => sendPromotionalEmail(message),
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Success",
        description: data.message || "Promotional emails sent successfully"
      });
      setIsEmailDialogOpen(false);
      setCustomMessage('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send promotional emails",
        variant: "destructive"
      });
    }
  });
  
  const sendLaunchAnnouncementMutation = useMutation({
    mutationFn: () => sendLaunchAnnouncement(),
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: "Success",
        description: data.message || "Launch announcements sent successfully"
      });
      setIsLaunchDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send launch announcements",
        variant: "destructive"
      });
    }
  });

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
    }
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const formatDate = (dateString: Date) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };
  
  const handleSendPromotionalEmail = () => {
    sendPromotionalEmailMutation.mutate(customMessage);
  };
  
  const handleSendLaunchAnnouncement = () => {
    sendLaunchAnnouncementMutation.mutate();
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Waitlist Admin</h1>
        <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
          {logoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />}
          Logout
        </Button>
      </div>
      
      <Tabs defaultValue="subscribers" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="email-marketing">Email Marketing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Waitlist Entries</CardTitle>
              <CardDescription>
                Manage all subscribers on the waiting list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No entries found. The waitlist is empty.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.id}</TableCell>
                        <TableCell>{entry.email}</TableCell>
                        <TableCell>{formatDate(entry.createdAt)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(entry.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="email-marketing">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Promotional Email</CardTitle>
                <CardDescription>
                  Send a promotional email to all waitlist subscribers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Message (Optional)</label>
                    <Textarea 
                      placeholder="Enter your custom promotional message here..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      This message will be included in the promotional email template.
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => setIsEmailDialogOpen(true)}
                    disabled={entries.length === 0}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Prepare Promotional Email
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Launch Announcement</CardTitle>
                <CardDescription>
                  Send a launch announcement to all waitlist subscribers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">
                    The launch announcement will inform your subscribers that your collection is now live
                    and they have exclusive early access.
                  </p>
                  
                  <Button 
                    className="w-full"
                    onClick={() => setIsLaunchDialogOpen(true)}
                    disabled={entries.length === 0}
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    Prepare Launch Announcement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this waitlist entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Promotional Email Confirmation Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Promotional Email</DialogTitle>
            <DialogDescription>
              You are about to send a promotional email to {entries.length} subscribers. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-medium mb-2">Email Preview:</p>
            <div className="border rounded-md p-3 bg-muted/50">
              <p className="text-sm mb-2"><strong>Subject:</strong> Special Announcement for Our Waitlist Members</p>
              <div className="text-sm">
                <p><strong>Message:</strong></p>
                <p className="text-muted-foreground">
                  {customMessage || "We have some exciting news to share with you about our upcoming collection."}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendPromotionalEmail}
              disabled={sendPromotionalEmailMutation.isPending}
            >
              {sendPromotionalEmailMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Launch Announcement Confirmation Dialog */}
      <Dialog open={isLaunchDialogOpen} onOpenChange={setIsLaunchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Launch Announcement</DialogTitle>
            <DialogDescription>
              You are about to send a launch announcement to {entries.length} subscribers. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-medium mb-2">Email Preview:</p>
            <div className="border rounded-md p-3 bg-muted/50">
              <p className="text-sm mb-2"><strong>Subject:</strong> Our Collection Has Launched - Exclusive Access Inside</p>
              <div className="text-sm">
                <p className="text-muted-foreground">
                  This email will announce that your collection is now live and provide subscribers with early access.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLaunchDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendLaunchAnnouncement}
              disabled={sendLaunchAnnouncementMutation.isPending}
            >
              {sendLaunchAnnouncementMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Send Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
