import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon, SendIcon, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { sendWhatsAppBulkMessage } from "@/utils/whatsAppUtils";
import { MarketingCampaign } from "@/types";
import { Badge } from "@/components/ui/badge";

const MarketingCampaigns = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { products, customers } = state;
  
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(
    JSON.parse(localStorage.getItem('marketing_campaigns') || '[]')
  );
  
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "category" | "specific">("all");
  const [targetValue, setTargetValue] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  
  const categories = Array.from(
    new Set(products.map(product => product.category || "Uncategorized"))
  );
  
  const handleNext = () => {
    if (step === 1) {
      if (!name) {
        toast.error("Please enter a campaign name");
        return;
      }
      if (!message) {
        toast.error("Please enter a message");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (targetType === "category" && !targetValue) {
        toast.error("Please select a category");
        return;
      }
      if (targetType === "specific" && selectedCustomers.length === 0) {
        toast.error("Please select at least one customer");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const getTargetCustomers = () => {
    switch (targetType) {
      case "all":
        return customers;
      case "category":
        const productIds = products
          .filter(p => (p.category || "Uncategorized") === targetValue)
          .map(p => p.id);
        
        const customerIds = new Set();
        state.orders.forEach(order => {
          if (order.items.some(item => productIds.includes(item.productId))) {
            customerIds.add(order.customerId);
          }
        });
        
        return customers.filter(customer => customerIds.has(customer.id));
      case "specific":
        return customers.filter(customer => selectedCustomers.includes(customer.id));
      default:
        return [];
    }
  };

  const saveCampaign = (status: "draft" | "scheduled" | "sent") => {
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
    
    const campaign: MarketingCampaign = {
      id: `camp${Date.now()}`,
      name,
      message,
      targetType,
      targetValue: targetType === "category" ? targetValue : undefined,
      status,
      scheduledDate: isScheduled ? date : undefined,
      sentDate: status === "sent" ? new Date() : undefined,
      createdBy: currentUser?.name || "Admin",
      createdAt: new Date()
    };
    
    const updatedCampaigns = [...campaigns, campaign];
    setCampaigns(updatedCampaigns);
    localStorage.setItem('marketing_campaigns', JSON.stringify(updatedCampaigns));
    
    if (currentUser?.name) {
      const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
      logs.push({
        id: `log${Date.now()}`,
        userId: currentUser.id || 'unknown',
        userName: currentUser.name,
        action: status === "sent" ? 'campaign_sent' : 'campaign_created',
        entityType: 'system',
        details: `Campaign "${name}" ${status === "sent" ? 'sent to' : 'created for'} ${getTargetCustomers().length} customers`,
        timestamp: new Date()
      });
      localStorage.setItem('activity_logs', JSON.stringify(logs));
    }
    
    toast.success(`Campaign ${status === "sent" ? "sent" : "saved"} successfully`);
    
    setName("");
    setMessage("");
    setTargetType("all");
    setTargetValue("");
    setDate(undefined);
    setIsScheduled(false);
    setSelectedCustomers([]);
    setStep(1);
  };

  const handleSendNow = async () => {
    const targetCustomers = getTargetCustomers();
    
    if (targetCustomers.length === 0) {
      toast.error("No customers to send to");
      return;
    }
    
    try {
      await sendWhatsAppBulkMessage(targetCustomers, message);
      saveCampaign("sent");
    } catch (error) {
      console.error("Error sending bulk message:", error);
      toast.error("Failed to send campaign");
    }
  };

  const handleSchedule = () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    
    saveCampaign("scheduled");
    toast.success(`Campaign scheduled for ${format(date, 'PPP')}`);
  };

  const toggleCustomerSelection = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Marketing Campaigns</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
                <CardDescription>Send WhatsApp messages to multiple customers</CardDescription>
              </CardHeader>
              <CardContent>
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Campaign Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Summer Sale Announcement"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Hello! We're excited to announce our summer sale with 20% off on all products. Shop now!"
                        rows={6}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        You can use placeholders like {"{{"} name {"}}"} that will be replaced with the customer's name.
                      </p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="targetType">Target Audience</Label>
                      <Select
                        value={targetType}
                        onValueChange={(value) => setTargetType(value as any)}
                      >
                        <SelectTrigger id="targetType">
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Customers</SelectItem>
                          <SelectItem value="category">By Product Category</SelectItem>
                          <SelectItem value="specific">Specific Customers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {targetType === "category" && (
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

                    {targetType === "specific" && (
                      <div className="space-y-2">
                        <Label>Select Customers</Label>
                        <div className="border rounded-md p-1 max-h-60 overflow-y-auto">
                          {customers.map(customer => (
                            <div 
                              key={customer.id}
                              className={cn(
                                "flex items-center p-2 hover:bg-muted/50 rounded-md cursor-pointer",
                                selectedCustomers.includes(customer.id) && "bg-primary/10"
                              )}
                              onClick={() => toggleCustomerSelection(customer.id)}
                            >
                              <div className="flex-1">
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-xs text-muted-foreground">{customer.phone}</p>
                              </div>
                              {selectedCustomers.includes(customer.id) && (
                                <CheckIcon className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Selected {selectedCustomers.length} of {customers.length} customers
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Send Options</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border cursor-pointer hover:border-primary" onClick={() => setIsScheduled(false)}>
                          <CardContent className={cn(
                            "p-4 flex items-center space-x-4",
                            !isScheduled && "border-2 border-primary"
                          )}>
                            <SendIcon className="h-5 w-5 text-primary" />
                            <div>
                              <h3 className="font-medium">Send Now</h3>
                              <p className="text-xs text-muted-foreground">
                                Send the campaign immediately
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card className="border cursor-pointer hover:border-primary" onClick={() => setIsScheduled(true)}>
                          <CardContent className={cn(
                            "p-4 flex items-center space-x-4",
                            isScheduled && "border-2 border-primary"
                          )}>
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            <div>
                              <h3 className="font-medium">Schedule</h3>
                              <p className="text-xs text-muted-foreground">
                                Select a date to send later
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {isScheduled && (
                      <div className="space-y-2">
                        <Label>Select Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}

                    <div className="rounded-md bg-muted/50 p-4">
                      <div className="flex items-center space-x-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">Campaign Summary</h3>
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">Name:</span> {name}</p>
                        <p><span className="font-medium">Target:</span> {
                          targetType === "all" ? "All Customers" :
                          targetType === "category" ? `Customers who bought ${targetValue}` :
                          `${selectedCustomers.length} selected customers`
                        }</p>
                        <p><span className="font-medium">Recipients:</span> {getTargetCustomers().length} customers</p>
                        <p><span className="font-medium">Delivery:</span> {
                          isScheduled ? `Scheduled for ${date ? format(date, "PPP") : "a future date"}` : "Immediate"
                        }</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {step > 1 ? (
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                ) : (
                  <Button variant="outline" onClick={() => navigate("/settings")}>Cancel</Button>
                )}
                
                {step < 3 ? (
                  <Button onClick={handleNext}>Next</Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => saveCampaign("draft")}>
                      Save as Draft
                    </Button>
                    {isScheduled ? (
                      <Button onClick={handleSchedule} disabled={!date}>
                        Schedule
                      </Button>
                    ) : (
                      <Button onClick={handleSendNow}>
                        Send Now
                      </Button>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                {campaigns.length > 0 ? (
                  campaigns
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map(campaign => (
                      <Card key={campaign.id} className="bg-muted/20">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{campaign.name}</h3>
                            <Badge variant={
                              campaign.status === "sent" ? "default" :
                              campaign.status === "scheduled" ? "secondary" : "outline"
                            }>
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm line-clamp-2">{campaign.message}</p>
                          <div className="text-xs text-muted-foreground">
                            <p>Created by {campaign.createdBy}</p>
                            <p>
                              {campaign.status === "sent" ? `Sent on ${new Date(campaign.sentDate!).toLocaleDateString()}` : 
                                campaign.status === "scheduled" ? `Scheduled for ${new Date(campaign.scheduledDate!).toLocaleDateString()}` :
                                `Created on ${new Date(campaign.createdAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No campaigns created yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MarketingCampaigns;
