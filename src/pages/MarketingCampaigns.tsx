
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MessageSquare, Plus, CalendarIcon, Users, Send, Edit, Trash, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { MarketingCampaign } from '@/types';
import NoContent from '@/components/NoContent';

const MarketingCampaigns = () => {
  const { state, logActivity } = useAppContext();
  const { currentUser, customers, products } = state;
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'category' | 'specific'>('all');
  const [targetValue, setTargetValue] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);

  // Get unique categories
  const categories = [...new Set(products
    .filter(product => product.category)
    .map(product => product.category as string))];

  useEffect(() => {
    // Load campaigns from localStorage
    const savedCampaigns = localStorage.getItem('marketing_campaigns');
    if (savedCampaigns) {
      try {
        const parsedCampaigns = JSON.parse(savedCampaigns);
        // Fix dates in campaigns
        const fixedCampaigns = parsedCampaigns.map((campaign: any) => ({
          ...campaign,
          scheduledDate: campaign.scheduledDate ? new Date(campaign.scheduledDate) : undefined,
          sentDate: campaign.sentDate ? new Date(campaign.sentDate) : undefined,
          createdAt: new Date(campaign.createdAt),
          // Ensure status is one of the allowed values
          status: ['draft', 'scheduled', 'sent', 'cancelled'].includes(campaign.status) 
            ? campaign.status 
            : 'draft'
        })) as MarketingCampaign[];
        setCampaigns(fixedCampaigns);
      } catch (error) {
        console.error("Error loading campaigns:", error);
        setCampaigns([]);
      }
    }
  }, []);

  // Save campaigns to localStorage
  const saveCampaigns = (updatedCampaigns: MarketingCampaign[]) => {
    localStorage.setItem('marketing_campaigns', JSON.stringify(updatedCampaigns));
    setCampaigns(updatedCampaigns);
  };

  const resetForm = () => {
    setName('');
    setMessage('');
    setTargetType('all');
    setTargetValue('');
    setScheduledDate(undefined);
    setEditingCampaign(null);
  };

  const handleOpenDialog = (campaign?: MarketingCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setName(campaign.name);
      setMessage(campaign.message);
      setTargetType(campaign.targetType);
      setTargetValue(campaign.targetValue || '');
      setScheduledDate(campaign.scheduledDate);
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !message) {
      toast.error("Campaign name and message are required");
      return;
    }

    if (targetType !== 'all' && !targetValue) {
      toast.error(`Please select a ${targetType === 'category' ? 'category' : 'customer'}`);
      return;
    }

    if (!editingCampaign) {
      // Create new campaign
      const newCampaign: MarketingCampaign = {
        id: `campaign-${Date.now()}`,
        name,
        message,
        targetType,
        targetValue: targetType !== 'all' ? targetValue : undefined,
        status: scheduledDate && scheduledDate > new Date() ? 'scheduled' : 'draft',
        scheduledDate,
        createdBy: currentUser?.id || 'unknown',
        createdAt: new Date()
      };

      const updatedCampaigns = [...campaigns, newCampaign];
      saveCampaigns(updatedCampaigns);
      logActivity('campaign_created', 'system', newCampaign.id, `Marketing campaign "${newCampaign.name}" created`);
      toast.success("Campaign created successfully");
    } else {
      // Update existing campaign
      const updatedCampaign: MarketingCampaign = {
        ...editingCampaign,
        name,
        message,
        targetType,
        targetValue: targetType !== 'all' ? targetValue : undefined,
        status: editingCampaign.status === 'sent' ? 'sent' : 
                scheduledDate && scheduledDate > new Date() ? 'scheduled' : 'draft',
        scheduledDate
      };

      const updatedCampaigns = campaigns.map(c => 
        c.id === updatedCampaign.id ? updatedCampaign : c
      );
      
      saveCampaigns(updatedCampaigns);
      logActivity('campaign_updated', 'system', updatedCampaign.id, `Marketing campaign "${updatedCampaign.name}" updated`);
      toast.success("Campaign updated successfully");
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteCampaign = (campaign: MarketingCampaign) => {
    if (window.confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)) {
      const updatedCampaigns = campaigns.filter(c => c.id !== campaign.id);
      saveCampaigns(updatedCampaigns);
      logActivity('campaign_deleted', 'system', campaign.id, `Marketing campaign "${campaign.name}" deleted`);
      toast.success("Campaign deleted successfully");
    }
  };

  const handleSendCampaign = (campaign: MarketingCampaign) => {
    setIsSending(true);

    // Get target customers based on campaign settings
    let targetCustomers: typeof customers = [];
    
    if (campaign.targetType === 'all') {
      targetCustomers = customers;
    } else if (campaign.targetType === 'category' && campaign.targetValue) {
      // Find customers who purchased products from this category
      const productIds = products
        .filter(p => p.category === campaign.targetValue)
        .map(p => p.id);
      
      // Find orders containing these products
      const orderIds = state.orders
        .filter(order => order.items.some(item => productIds.includes(item.productId)))
        .map(order => order.id);
      
      // Find customers who placed these orders
      targetCustomers = customers.filter(customer => 
        customer.orders.some(orderId => orderIds.includes(orderId))
      );
    } else if (campaign.targetType === 'specific' && campaign.targetValue) {
      // Specific customer
      const customer = customers.find(c => c.id === campaign.targetValue);
      if (customer) {
        targetCustomers = [customer];
      }
    }

    // Simulate sending to all eligible customers
    setTimeout(() => {
      // Update campaign status
      const updatedCampaign: MarketingCampaign = {
        ...campaign,
        status: 'sent',
        sentDate: new Date()
      };

      const updatedCampaigns = campaigns.map(c => 
        c.id === campaign.id ? updatedCampaign : c
      );
      
      saveCampaigns(updatedCampaigns);
      logActivity(
        'campaign_sent', 
        'system', 
        campaign.id, 
        `Marketing campaign "${campaign.name}" sent to ${targetCustomers.length} customers`
      );
      
      toast.success(`Campaign sent to ${targetCustomers.length} customers`);
      setIsSending(false);
    }, 2000);
  };

  // Restrict access based on permissions
  if (currentUser && !currentUser.permissions.canSendMarketing) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-medium">Access Denied</h2>
            <p className="text-muted-foreground">You do not have permission to access marketing campaigns.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Marketing Campaigns</h1>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Campaigns</CardTitle>
            <CardDescription>
              Send targeted WhatsApp marketing messages to your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <NoContent
                title="No campaigns found"
                description="You haven't created any marketing campaigns yet."
                actionText="Create Campaign"
                actionLink="#"
                icon={<Megaphone className="h-12 w-12 text-primary/20" />}
                onAction={() => handleOpenDialog()}
              />
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                          {campaign.targetType === 'all' ? (
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              All Customers
                            </span>
                          ) : campaign.targetType === 'category' ? (
                            <span>Category: {campaign.targetValue}</span>
                          ) : (
                            <span>
                              {customers.find(c => c.id === campaign.targetValue)?.name || 'Specific Customer'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              campaign.status === 'sent' ? 'default' :
                              campaign.status === 'scheduled' ? 'secondary' :
                              campaign.status === 'draft' ? 'outline' : 'destructive'
                            }
                          >
                            {campaign.status === 'sent' ? 'Sent' :
                             campaign.status === 'scheduled' ? 'Scheduled' :
                             campaign.status === 'draft' ? 'Draft' : 'Cancelled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.scheduledDate ? 
                            format(new Date(campaign.scheduledDate), 'PPP') : 
                            'Not scheduled'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(campaign.createdAt), 'PPP')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            {campaign.status !== 'sent' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendCampaign(campaign)}
                                disabled={isSending}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Send
                              </Button>
                            )}
                            {campaign.status !== 'sent' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(campaign)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCampaign(campaign)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
              <DialogDescription>
                {editingCampaign 
                  ? 'Update your marketing campaign details' 
                  : 'Create a new WhatsApp marketing campaign to reach your customers'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter campaign name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message Text</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message to send to customers..."
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: {"{{"} customerName {"}}"}, {"{{"} productName {"}}"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-type">Target Audience</Label>
                <Select 
                  value={targetType} 
                  onValueChange={(value: 'all' | 'category' | 'specific') => {
                    setTargetType(value);
                    setTargetValue('');
                  }}
                >
                  <SelectTrigger id="target-type">
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="category">By Product Category</SelectItem>
                    <SelectItem value="specific">Specific Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {targetType === 'category' && (
                <div className="space-y-2">
                  <Label htmlFor="category">Select Category</Label>
                  <Select 
                    value={targetValue} 
                    onValueChange={setTargetValue}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category, index) => (
                        <SelectItem key={index} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {targetType === 'specific' && (
                <div className="space-y-2">
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select 
                    value={targetValue} 
                    onValueChange={setTargetValue}
                  >
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Display estimated recipients count */}
              <div className="mt-4 py-3 px-4 bg-muted/40 rounded-md">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {targetType === 'all' 
                      ? `${customers.length} customers will receive this message`
                      : targetType === 'category' && targetValue
                        ? `Approximately ${customers.filter(c => 
                            state.orders
                              .filter(o => o.customerId === c.id)
                              .some(o => o.items.some(i => 
                                products.find(p => p.id === i.productId)?.category === targetValue
                              ))
                          ).length} customers will receive this message`
                        : targetType === 'specific' && targetValue
                          ? '1 customer will receive this message'
                          : 'Select a target to see recipient count'
                    }
                  </span>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">
                  {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default MarketingCampaigns;
