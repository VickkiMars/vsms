/**
 * Global Search Utility for VSMS (Visitor Security Management System)
 * 
 * Provides unified, deep searching across all visitor records (past and present),
 * covering core attributes, host details, vehicle information, notes, dynamic
 * custom fields, and status aliases.
 */

/**
 * Checks if a visitor record matches a search query string.
 * Supports deep matching across full name, badge ID, visitor ID, phone, email,
 * company, host, department, purpose, vehicle plate, notes, status (including
 * keywords "past", "checked-out", "inside", "present", "overdue"), and custom data.
 *
 * @param {Object} visitor - Visitor entity
 * @param {string} query - Raw search query string
 * @returns {boolean} True if matching, false otherwise
 */
export const matchVisitor = (visitor, query) => {
  if (!visitor) return false;
  if (!query || typeof query !== 'string') return true;

  const q = query.toLowerCase().trim();
  if (!q) return true;

  const isPast = visitor.status === 'Checked-Out';
  const isPresent = visitor.status === 'Checked-In' || visitor.status === 'Overdue';

  // Status alias matching
  if ((q === 'past' || q === 'checked-out' || q === 'checked out' || q === 'exited' || q === 'departed') && isPast) {
    return true;
  }
  if ((q === 'present' || q === 'inside' || q === 'active' || q === 'current') && isPresent) {
    return true;
  }
  if (q === 'overdue' && visitor.status === 'Overdue') {
    return true;
  }

  // Core identifiers & details
  if (visitor.fullName && visitor.fullName.toLowerCase().includes(q)) return true;
  if (visitor.badgeId && visitor.badgeId.toLowerCase().includes(q)) return true;
  if (visitor.id && visitor.id.toLowerCase().includes(q)) return true;
  if (visitor.idNumber && visitor.idNumber.toLowerCase().includes(q)) return true;
  if (visitor.idType && visitor.idType.toLowerCase().includes(q)) return true;
  if (visitor.phone && visitor.phone.toLowerCase().includes(q)) return true;
  if (visitor.email && visitor.email.toLowerCase().includes(q)) return true;
  if (visitor.company && visitor.company.toLowerCase().includes(q)) return true;
  if (visitor.hostName && visitor.hostName.toLowerCase().includes(q)) return true;
  if (visitor.department && visitor.department.toLowerCase().includes(q)) return true;
  if (visitor.purpose && visitor.purpose.toLowerCase().includes(q)) return true;
  if (visitor.vehiclePlate && visitor.vehiclePlate.toLowerCase().includes(q)) return true;
  if (visitor.notes && visitor.notes.toLowerCase().includes(q)) return true;
  if (visitor.status && visitor.status.toLowerCase().includes(q)) return true;

  // Custom data fields (both JSON string and parsed object)
  if (visitor.custom_data_json && visitor.custom_data_json.toLowerCase().includes(q)) {
    return true;
  }
  if (visitor.custom_data && typeof visitor.custom_data === 'object') {
    try {
      const customStr = JSON.stringify(visitor.custom_data).toLowerCase();
      if (customStr.includes(q)) return true;
    } catch {
      // Ignore serialization errors
    }
  }

  return false;
};

/**
 * Partitions visitors into past and present matching records.
 *
 * @param {Array} visitors - Array of visitor records
 * @param {string} query - Raw search query string
 * @param {string} deptFilter - Department filter name or 'All'
 * @returns {Object} { allMatches, presentMatches, pastMatches, overdueMatches }
 */
export const filterAndCategorizeVisitors = (visitors = [], query = '', deptFilter = 'All') => {
  if (!Array.isArray(visitors)) {
    return { allMatches: [], presentMatches: [], pastMatches: [], overdueMatches: [] };
  }

  const allMatches = [];
  const presentMatches = [];
  const pastMatches = [];
  const overdueMatches = [];

  for (const v of visitors) {
    if (!v) continue;

    // Department filter
    if (deptFilter && deptFilter !== 'All' && v.department !== deptFilter) {
      continue;
    }

    // Search query matching
    if (!matchVisitor(v, query)) {
      continue;
    }

    allMatches.push(v);

    if (v.status === 'Checked-Out') {
      pastMatches.push(v);
    } else {
      presentMatches.push(v);
      if (v.status === 'Overdue') {
        overdueMatches.push(v);
      }
    }
  }

  return { allMatches, presentMatches, pastMatches, overdueMatches };
};
