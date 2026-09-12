export const DEPARTMENTS = [
  { id: 'dept-1', name: 'Executive Suite', code: 'EXEC', head: 'Dr. Elizabeth Vance-Okeke', floor: 'Level 5, Eko Tower, Victoria Island, Lagos' },
  { id: 'dept-2', name: 'Information Technology & Cyber Security', code: 'ITCS', head: 'Engr. Marcus Sterling', floor: 'Level 3, Nicon Plaza, CBD, Abuja' },
  { id: 'dept-3', name: 'Human Resources & Talent', code: 'HR', head: 'Aisha Al-Mansoor', floor: 'Level 2, Marina House, Lagos Island' },
  { id: 'dept-4', name: 'Finance & Accounting', code: 'FIN', head: 'Emeka O’Connor', floor: 'Level 4, Eko Tower, Victoria Island' },
  { id: 'dept-5', name: 'Legal & Regulatory Compliance', code: 'LEGAL', head: 'Amina Bello', floor: 'Level 4, Nicon Plaza, Abuja' },
  { id: 'dept-6', name: 'Procurement & Logistics', code: 'PROC', head: 'Chinedu Eze', floor: 'Ground Floor, Logistics Wing, Ikeja, Lagos' },
];

export const HOSTS = [
  { id: 'host-1', name: 'Dr. Elizabeth Vance-Okeke', title: 'Managing Director', deptId: 'dept-1', email: 'e.vance@security.gov.ng' },
  { id: 'host-2', name: 'Engr. Marcus Sterling', title: 'Chief Information Officer', deptId: 'dept-2', email: 'm.sterling@security.gov.ng' },
  { id: 'host-3', name: 'Aisha Al-Mansoor', title: 'Head of People & HR', deptId: 'dept-3', email: 'a.almansoor@security.gov.ng' },
  { id: 'host-4', name: 'Emeka O’Connor', title: 'Financial Controller', deptId: 'dept-4', email: 'e.oconnor@security.gov.ng' },
  { id: 'host-5', name: 'Amina Bello', title: 'Senior Legal Counsel', deptId: 'dept-5', email: 'a.bello@security.gov.ng' },
  { id: 'host-6', name: 'Chinedu Eze', title: 'Procurement Manager', deptId: 'dept-6', email: 'c.eze@security.gov.ng' },
  { id: 'host-7', name: 'Dr. Alex Rivera', title: 'Senior Systems Architect', deptId: 'dept-2', email: 'a.rivera@security.gov.ng' },
  { id: 'host-8', name: 'Claire Okonjo', title: 'Talent Acquisition Lead', deptId: 'dept-3', email: 'c.okonjo@security.gov.ng' },
];

export const VISIT_PURPOSES = [
  'Official Meeting',
  'Job Interview',
  'Contractor / Technical Maintenance',
  'Document Delivery / Courier',
  'Regulatory Inspection / NDPR Audit',
  'Personal Visit',
  'Vendor Presentation',
];

export const ID_TYPES = [
  'National Identity Number (NIN)',
  'Driver’s License (FRSC)',
  'International Passport',
  'Voter’s Card (INEC)',
  'Corporate Staff ID',
];

// Helper to generate ISO strings relative to today
const today = new Date();
const formatIso = (hoursAgo, minutesAgo = 0) => {
  const d = new Date(today);
  d.setHours(d.getHours() - hoursAgo);
  d.setMinutes(d.getMinutes() - minutesAgo);
  return d.toISOString();
};

export const INITIAL_VISITORS = [];
