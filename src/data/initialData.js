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

// Baseline & Dynamic Field Definitions for Seed Org
export const DEFAULT_ORG_FIELDS = [
  {
    id: 'FLD-01',
    org_id: '',
    field_key: 'fullName',
    field_name: 'Full Legal Name',
    field_type: 'text',
    is_required: 1,
    show_in_table: 1,
    show_on_badge: 1,
    options_json: null,
    placeholder: 'e.g. Dr. Samuel Adeleke',
    display_order: 1,
    is_baseline: 1
  },
  {
    id: 'FLD-02',
    org_id: '',
    field_key: 'phone',
    field_name: 'Phone / Mobile',
    field_type: 'text',
    is_required: 1,
    show_in_table: 1,
    show_on_badge: 1,
    options_json: null,
    placeholder: '+234 803 000 0000',
    display_order: 2,
    is_baseline: 1
  },
  {
    id: 'FLD-03',
    org_id: '',
    field_key: 'company',
    field_name: 'Company / Organization',
    field_type: 'text',
    is_required: 0,
    show_in_table: 1,
    show_on_badge: 1,
    options_json: null,
    placeholder: 'e.g. Acme Corp / Self-Employed',
    display_order: 3,
    is_baseline: 0
  },
  {
    id: 'FLD-04',
    org_id: '',
    field_key: 'host',
    field_name: 'Visiting Host / Staff',
    field_type: 'host_picker',
    is_required: 1,
    show_in_table: 1,
    show_on_badge: 1,
    options_json: null,
    placeholder: 'Select staff member to visit',
    display_order: 4,
    is_baseline: 0
  },
  {
    id: 'FLD-05',
    org_id: '',
    field_key: 'purpose',
    field_name: 'Purpose of Visit',
    field_type: 'text',
    is_required: 1,
    show_in_table: 1,
    show_on_badge: 0,
    options_json: null,
    placeholder: 'e.g. Official Meeting / Site Visit',
    display_order: 5,
    is_baseline: 0
  },
  {
    id: 'FLD-06',
    org_id: '',
    field_key: 'expectedDurationMinutes',
    field_name: 'Expected Stay (Minutes)',
    field_type: 'number',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    options_json: null,
    placeholder: '60',
    display_order: 6,
    is_baseline: 0
  },
  {
    id: 'FLD-07',
    org_id: '',
    field_key: 'idType',
    field_name: 'Government ID Type',
    field_type: 'select',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    options_json: JSON.stringify([
      'National Identity Card (NIN)',
      'Driver’s License',
      'International Passport',
      'Work Permit',
      'Corporate Staff ID',
      'Other'
    ]),
    options: [
      'National Identity Card (NIN)',
      'Driver’s License',
      'International Passport',
      'Work Permit',
      'Corporate Staff ID',
      'Other'
    ],
    placeholder: 'Select ID type',
    display_order: 7,
    is_baseline: 0
  },
  {
    id: 'FLD-08',
    org_id: '',
    field_key: 'idNumber',
    field_name: 'ID / Document Number',
    field_type: 'text',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    options_json: null,
    placeholder: 'e.g. NIN-123456789',
    display_order: 8,
    is_baseline: 0
  },
  {
    id: 'FLD-09',
    org_id: '',
    field_key: 'vehiclePlate',
    field_name: 'Vehicle Plate Number',
    field_type: 'text',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    options_json: null,
    placeholder: 'e.g. KJA-104-AB',
    display_order: 9,
    is_baseline: 0
  },
  {
    id: 'FLD-10',
    org_id: '',
    field_key: 'notes',
    field_name: 'Security Notes / Remarks',
    field_type: 'textarea',
    is_required: 0,
    show_in_table: 0,
    show_on_badge: 0,
    options_json: null,
    placeholder: 'Any special remarks or security clearances',
    display_order: 10,
    is_baseline: 0
  }
];

// Default seed users for Auth system
export const SEED_USERS = [
  {
    id: 'USR-001',
    org_id: '',
    email: 'admin@vsms.com',
    password_hash: 'admin123',
    fullName: 'Chief Security Director',
    role: 'admin',
    desk_location: 'Executive HQ - Security Suite',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  },
  {
    id: 'USR-002',
    org_id: '',
    email: 'guard@vsms.com',
    password_hash: 'guard123',
    fullName: 'Officer James Sterling',
    role: 'security',
    desk_location: 'Gatehouse Alpha - North Gate',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  },
  {
    id: 'USR-003',
    org_id: '',
    email: 'reception@vsms.com',
    password_hash: 'reception123',
    fullName: 'Front Desk Reception',
    role: 'reception',
    desk_location: 'Main Tower - Lobby Desk 1',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
  }
];
