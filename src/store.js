import { create } from 'zustand';

const TENANTS = [
  { id: 1, name: 'AeroParts Global Inc.', subdomain: 'aeroparts', active: true },
  { id: 2, name: 'Apex Logistics & Procurement', subdomain: 'apexprocure', active: true },
];

const USERS = [
  { id: 1, tenantId: 1, email: 'officer@aeroparts.com', role: 'PROCUREMENT_OFFICER', name: 'Aarav Sharma', active: true },
  { id: 2, tenantId: 1, email: 'manager@aeroparts.com', role: 'MANAGER_APPROVER', name: 'Devendra Patel', active: true },
  { id: 3, tenantId: 1, email: 'vendor@titanium.com', role: 'VENDOR', name: 'Rajesh Mehta', active: true, vendorId: 1 },
  { id: 4, tenantId: 1, email: 'admin@aeroparts.com', role: 'ADMIN', name: 'Priya Iyer', active: true },
];

const VENDORS = [
  { id: 1, tenantId: 1, company: 'Hindustan Titanium & Alloys', category: 'Raw Materials', gst: '27AAAAA1111A1Z1', phone: '+91 98765 43210', address: 'Plot 42, GIDC Industrial Estate', city: 'Ahmedabad', state: 'Gujarat', zip: '380015', status: 'ACTIVE', rating: 4.8, email: 'vendor@titanium.com' },
  { id: 2, tenantId: 1, company: 'Balaji Swift Logistics', category: 'Logistics', gst: '27BBBBB2222B2Z2', phone: '+91 91234 56789', address: 'Cargo Hub 10, Airport Road', city: 'Mumbai', state: 'Maharashtra', zip: '400099', status: 'ACTIVE', rating: 4.2, email: 'ops@swiftlogistics.in' },
  { id: 3, tenantId: 1, company: 'Maha Electronics Private Ltd', category: 'Hardware', gst: '27CCCCC3333C3Z3', phone: '+91 94567 12345', address: 'Sector V, Salt Lake', city: 'Kolkata', state: 'West Bengal', zip: '700091', status: 'PENDING', rating: 3.9, email: 'sales@neoelec.com' },
  { id: 4, tenantId: 1, company: 'Anant Precision Alloys', category: 'Raw Materials', gst: '29DDDDD4444D4Z4', phone: '+91 80234 56789', address: 'Industrial Area Phase II', city: 'Bangalore', state: 'Karnataka', zip: '560058', status: 'ACTIVE', rating: 4.5, email: 'info@precisioncast.co' },
  { id: 5, tenantId: 1, company: 'Ganga Green Pack Solutions', category: 'Packaging', gst: '07EEEEE5555E5Z5', phone: '+91 11234 56789', address: 'Okhla Industrial Estate', city: 'New Delhi', state: 'Delhi', zip: '110020', status: 'ACTIVE', rating: 4.1, email: 'orders@greenpack.in' },
];

const RFQS = [
  {
    id: 1, tenantId: 1, title: '500x High-Tensile Aerospace Titanium Rods',
    description: 'Supply of Grade 5 (Ti-6Al-4V) titanium rods for high-stress aerospace housing components. Must be supplied with certified chemical and physical properties datasheet.',
    quantity: 500, sku: 'TI-ROD-G5-012',
    specs: { diameter: '25mm', length: '1000mm', certification: 'AMS 4928' },
    deadline: '2026-07-15', status: 'PUBLISHED', createdBy: 1, createdAt: '2026-06-01T10:00:00Z',
    invitedVendors: [1, 3], attachments: ['material_spec_v2.pdf'],
  },
  {
    id: 2, tenantId: 1, title: '1200x Customized PCB Fabrication Boards',
    description: 'Multi-layered dynamic PCB boards with gold plating and rigorous thermal testing for engine guidance systems.',
    quantity: 1200, sku: 'PCB-ML-GUIDE-X',
    specs: { layers: 8, thermalTg: '180°C', finish: 'ENIG' },
    deadline: '2026-08-01', status: 'DRAFT', createdBy: 1, createdAt: '2026-06-05T14:30:00Z',
    invitedVendors: [3], attachments: [],
  },
  {
    id: 3, tenantId: 1, title: '2000x Corrugated Shipping Cartons (Heavy-Duty)',
    description: 'Triple-wall corrugated boxes for international aerospace component shipping. Must withstand 300kg stacking.',
    quantity: 2000, sku: 'PKG-COR-HD-300',
    specs: { wall: 'Triple', burstStrength: '35 kg/cm²', printType: '2-Color Flexo' },
    deadline: '2026-07-20', status: 'PUBLISHED', createdBy: 1, createdAt: '2026-06-03T09:00:00Z',
    invitedVendors: [5], attachments: ['box_dimensions.pdf'],
  },
];

const QUOTATIONS = [
  { id: 1, tenantId: 1, rfqId: 1, vendorId: 1, unitPrice: 45.00, total: 22500.00, deliveryDays: 14, notes: 'Fully compliant with AMS 4928 specifications. Ready for immediate production run.', status: 'SUBMITTED', submittedAt: '2026-06-03T09:15:00Z', tax: 4050.00 },
  { id: 2, tenantId: 1, rfqId: 1, vendorId: 3, unitPrice: 42.50, total: 21250.00, deliveryDays: 20, notes: 'Can fulfill specifications with secondary alloy vetting checks.', status: 'SUBMITTED', submittedAt: '2026-06-04T16:45:00Z', tax: 3825.00 },
  { id: 3, tenantId: 1, rfqId: 1, vendorId: 4, unitPrice: 47.25, total: 23625.00, deliveryDays: 10, notes: 'Premium grade with express manufacturing. Independent lab certs included.', status: 'SUBMITTED', submittedAt: '2026-06-05T11:00:00Z', tax: 4252.50 },
  { id: 4, tenantId: 1, rfqId: 3, vendorId: 5, unitPrice: 3.20, total: 6400.00, deliveryDays: 7, notes: 'Standard corrugated boxes. Bulk pricing applied.', status: 'SUBMITTED', submittedAt: '2026-06-04T10:00:00Z', tax: 1152.00 },
];

const PURCHASE_ORDERS = [
  { id: 1, tenantId: 1, poNumber: 'PO-2026-0001', rfqId: 1, vendorId: 1, quotationId: 1, total: 22500.00, status: 'APPROVED', createdBy: 1, createdAt: '2026-06-04T11:00:00Z', remarks: 'Best balance of cost and delivery time' },
];

const GRNS = [
  { id: 1, tenantId: 1, poId: 1, receivedBy: 1, challanRef: 'DC-TITAN-889', receivedQty: 500, receivedDate: '2026-06-05T16:00:00Z', status: 'COMPLETED', inspector: 'Aarav Sharma' },
];

const INVOICES = [
  { id: 1, tenantId: 1, invoiceNumber: 'INV-TITAN-4451', poId: 1, grnId: 1, netAmount: 22500.00, taxAmount: 4050.00, totalAmount: 26550.00, status: 'PAID', vendorId: 1, createdAt: '2026-06-05T17:30:00Z', dueDate: '2026-07-05' },
];

const APPROVAL_RULES = [
  { id: 1, tenantId: 1, step: 'Low Risk Spend', minAmount: 0, maxAmount: 5000, role: 'PROCUREMENT_OFFICER' },
  { id: 2, tenantId: 1, step: 'Standard Purchase', minAmount: 5000.01, maxAmount: 50000, role: 'MANAGER_APPROVER' },
  { id: 3, tenantId: 1, step: 'Strategic Spend', minAmount: 50000.01, maxAmount: 1000000, role: 'ADMIN' },
];

const AUDIT_LOGS = [
  { id: 1, tenantId: 1, userId: 4, action: 'VENDOR_VERIFIED', entity: 'Vendor', entityId: 1, details: 'Hindustan Titanium & Alloys verified and activated', ip: '192.168.1.45', createdAt: '2026-06-01T09:00:00Z' },
  { id: 2, tenantId: 1, userId: 1, action: 'RFQ_PUBLISHED', entity: 'RFQ', entityId: 1, details: 'Published RFQ for 500x Titanium Rods', ip: '192.168.1.12', createdAt: '2026-06-01T10:15:00Z' },
  { id: 3, tenantId: 1, userId: 2, action: 'PO_APPROVED', entity: 'PurchaseOrder', entityId: 1, details: 'Approved PO-2026-0001 for $22,500', ip: '192.168.1.18', createdAt: '2026-06-04T11:00:00Z' },
  { id: 4, tenantId: 1, userId: 1, action: 'GRN_COMPLETED', entity: 'GRN', entityId: 1, details: 'Received 500 units against DC-TITAN-889', ip: '192.168.1.12', createdAt: '2026-06-05T16:00:00Z' },
  { id: 5, tenantId: 1, userId: 4, action: 'INVOICE_PAID', entity: 'Invoice', entityId: 1, details: 'Payment processed for INV-TITAN-4451', ip: '192.168.1.45', createdAt: '2026-06-05T18:00:00Z' },
  { id: 6, tenantId: 1, userId: 3, action: 'QUOTE_SUBMITTED', entity: 'Quotation', entityId: 1, details: 'Rajesh Mehta submitted quote for RFQ-1', ip: '192.168.4.11', createdAt: '2026-06-03T09:15:00Z' },
];

const CHAT_MESSAGES = [
  { id: 1, rfqId: 1, senderId: 1, senderName: 'Aarav Sharma', senderRole: 'PROCUREMENT_OFFICER', message: 'Please clarify if your AMS 4928 certification is validated by an independent third-party laboratory.', timestamp: '2026-06-02T14:10:00Z' },
  { id: 2, rfqId: 1, senderId: 3, senderName: 'Rajesh Mehta', senderRole: 'VENDOR', message: 'Yes Aarav, we possess testing certificates verified by SGS Laboratories. I can append the PDF reports to our quotation.', timestamp: '2026-06-03T09:05:00Z' },
  { id: 3, rfqId: 1, senderId: 1, senderName: 'Aarav Sharma', senderRole: 'PROCUREMENT_OFFICER', message: 'That would be excellent. Also, can you confirm batch traceability for each rod?', timestamp: '2026-06-03T10:20:00Z' },
];

const COMPLIANCE_RULES = `IF spend IS OVER 5000 THEN ROUTE TO MANAGER_APPROVER;
IF vendor_rating IS UNDER 4.0 THEN REQUIRE SECONDARY_APPROVAL;
IF category IS "Raw Materials" AND spend IS OVER 20000 THEN REQUIRE ADMIN_REVIEW;`;

const NOTIFICATIONS = [
  { id: 1, userId: 1, title: 'New quotation received', message: 'Rajesh Mehta submitted a quotation for RFQ-1', read: false, createdAt: '2026-06-03T09:15:00Z', type: 'quote' },
  { id: 2, userId: 1, title: 'PO Approved', message: 'Devendra Patel approved PO-2026-0001', read: true, createdAt: '2026-06-04T11:00:00Z', type: 'approval' },
  { id: 3, userId: 2, title: 'Approval Required', message: 'New PO pending your approval: PO-2026-0001', read: false, createdAt: '2026-06-04T10:30:00Z', type: 'approval' },
];

export const useStore = create((set, get) => ({
  isAuthenticated: false,
  currentUser: null,
  tenants: TENANTS,
  activeTenant: TENANTS[0],
  users: USERS,

  login: (email, password) => {
    const user = USERS.find(u => u.email === email);
    if (user) { set({ isAuthenticated: true, currentUser: user }); return true; }
    return false;
  },
  logout: () => set({ isAuthenticated: false, currentUser: null }),
  switchUser: (userId) => {
    const user = USERS.find(u => u.id === parseInt(userId));
    if (user) set({ currentUser: user });
  },
  switchTenant: (tenantId) => {
    const tenant = TENANTS.find(t => t.id === parseInt(tenantId));
    if (tenant) set({ activeTenant: tenant });
  },

  vendors: VENDORS,
  addVendor: (vendor) => set(s => ({
    vendors: [...s.vendors, { ...vendor, id: s.vendors.length + 1, tenantId: s.activeTenant.id, status: 'PENDING', rating: 0 }],
    auditLogs: [{ id: s.auditLogs.length + 1, tenantId: s.activeTenant.id, userId: s.currentUser?.id, action: 'VENDOR_REGISTERED', entity: 'Vendor', entityId: s.vendors.length + 1, details: `Registered ${vendor.company}`, ip: '127.0.0.1', createdAt: new Date().toISOString() }, ...s.auditLogs],
  })),
  updateVendorStatus: (vendorId, status) => set(s => ({
    vendors: s.vendors.map(v => v.id === vendorId ? { ...v, status } : v),
    auditLogs: [{ id: s.auditLogs.length + 1, tenantId: s.activeTenant.id, userId: s.currentUser?.id, action: status === 'ACTIVE' ? 'VENDOR_VERIFIED' : 'VENDOR_SUSPENDED', entity: 'Vendor', entityId: vendorId, details: `Vendor status changed to ${status}`, ip: '127.0.0.1', createdAt: new Date().toISOString() }, ...s.auditLogs],
  })),

  rfqs: RFQS,
  addRfq: (rfq) => set(s => {
    const newRfq = { ...rfq, id: s.rfqs.length + 1, tenantId: s.activeTenant.id, createdBy: s.currentUser?.id, createdAt: new Date().toISOString(), status: 'PUBLISHED' };
    return {
      rfqs: [newRfq, ...s.rfqs],
      auditLogs: [{ id: s.auditLogs.length + 1, tenantId: s.activeTenant.id, userId: s.currentUser?.id, action: 'RFQ_PUBLISHED', entity: 'RFQ', entityId: newRfq.id, details: `Published: ${rfq.title}`, ip: '127.0.0.1', createdAt: new Date().toISOString() }, ...s.auditLogs],
    };
  }),

  quotations: QUOTATIONS,
  addQuotation: (quote) => set(s => {
    const rfq = s.rfqs.find(r => r.id === quote.rfqId);
    const total = quote.unitPrice * (rfq?.quantity || 0);
    const tax = total * 0.18;
    const newQuote = { ...quote, id: s.quotations.length + 1, tenantId: s.activeTenant.id, total, tax, status: 'SUBMITTED', submittedAt: new Date().toISOString() };
    return {
      quotations: [newQuote, ...s.quotations],
      auditLogs: [{ id: s.auditLogs.length + 1, tenantId: s.activeTenant.id, userId: s.currentUser?.id, action: 'QUOTE_SUBMITTED', entity: 'Quotation', entityId: newQuote.id, details: `Quote $${total.toLocaleString()} for RFQ-${quote.rfqId}`, ip: '127.0.0.1', createdAt: new Date().toISOString() }, ...s.auditLogs],
    };
  }),

  purchaseOrders: PURCHASE_ORDERS,
  createPO: (quotationId) => set(s => {
    const q = s.quotations.find(qt => qt.id === quotationId);
    if (!q) return s;
    const autoApprove = q.total <= 5000;
    const po = {
      id: s.purchaseOrders.length + 1, tenantId: s.activeTenant.id,
      poNumber: `PO-2026-${String(s.purchaseOrders.length + 1).padStart(4, '0')}`,
      rfqId: q.rfqId, vendorId: q.vendorId, quotationId: q.id,
      total: q.total, status: autoApprove ? 'APPROVED' : 'PENDING_APPROVAL',
      createdBy: s.currentUser?.id, createdAt: new Date().toISOString(), remarks: '',
    };
    return {
      purchaseOrders: [po, ...s.purchaseOrders],
      auditLogs: [{ id: s.auditLogs.length + 1, tenantId: s.activeTenant.id, userId: s.currentUser?.id, action: 'PO_CREATED', entity: 'PurchaseOrder', entityId: po.id, details: `Created ${po.poNumber} — $${po.total.toLocaleString()}`, ip: '127.0.0.1', createdAt: new Date().toISOString() }, ...s.auditLogs],
    };
  }),
  approvePO: (poId, remarks) => set(s => ({
    purchaseOrders: s.purchaseOrders.map(po => po.id === poId ? { ...po, status: 'APPROVED', remarks } : po),
    auditLogs: [{ id: s.auditLogs.length + 1, tenantId: s.activeTenant.id, userId: s.currentUser?.id, action: 'PO_APPROVED', entity: 'PurchaseOrder', entityId: poId, details: `Approved with remarks: ${remarks}`, ip: '127.0.0.1', createdAt: new Date().toISOString() }, ...s.auditLogs],
  })),
  rejectPO: (poId, remarks) => set(s => ({
    purchaseOrders: s.purchaseOrders.map(po => po.id === poId ? { ...po, status: 'REJECTED', remarks } : po),
    auditLogs: [{ id: s.auditLogs.length + 1, tenantId: s.activeTenant.id, userId: s.currentUser?.id, action: 'PO_REJECTED', entity: 'PurchaseOrder', entityId: poId, details: `Rejected: ${remarks}`, ip: '127.0.0.1', createdAt: new Date().toISOString() }, ...s.auditLogs],
  })),

  grns: GRNS,
  addGrn: (grn) => set(s => ({
    grns: [{ ...grn, id: s.grns.length + 1, tenantId: s.activeTenant.id, status: 'COMPLETED', receivedDate: new Date().toISOString() }, ...s.grns],
  })),

  invoices: INVOICES,
  addInvoice: (inv) => set(s => ({
    invoices: [{ ...inv, id: s.invoices.length + 1, tenantId: s.activeTenant.id, createdAt: new Date().toISOString() }, ...s.invoices],
  })),
  updateInvoiceStatus: (invId, status) => set(s => ({
    invoices: s.invoices.map(i => i.id === invId ? { ...i, status } : i),
  })),

  approvalRules: APPROVAL_RULES,
  auditLogs: AUDIT_LOGS,

  chatMessages: CHAT_MESSAGES,
  sendMessage: (rfqId, message) => set(s => ({
    chatMessages: [...s.chatMessages, {
      id: s.chatMessages.length + 1, rfqId, senderId: s.currentUser?.id,
      senderName: s.currentUser?.name, senderRole: s.currentUser?.role,
      message, timestamp: new Date().toISOString(),
    }],
  })),

  complianceRules: COMPLIANCE_RULES,
  setComplianceRules: (rules) => set({ complianceRules: rules }),

  notifications: NOTIFICATIONS,
  markNotificationRead: (id) => set(s => ({
    notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
  })),
  addNotification: (notif) => set(s => ({
    notifications: [{ ...notif, id: s.notifications.length + 1, read: false, createdAt: new Date().toISOString() }, ...s.notifications],
  })),

  toast: null,
  showToast: (text, success = true) => {
    set({ toast: { text, success } });
    setTimeout(() => set({ toast: null }), 4000);
  },
}));
