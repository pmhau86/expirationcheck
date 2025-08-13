// Mock API Responses for Testing

/**
 * Mock successful domain list response
 */
const mockDomainsResponse = {
  total: 5,
  documents: [
    {
      $id: '1',
      domain: 'example.com',
      issued_date: '2023-01-01T00:00:00.000Z',
      expire_date: '2024-12-31T23:59:59.000Z',
      $createdAt: '2023-01-01T00:00:00.000Z',
      $updatedAt: '2023-01-01T00:00:00.000Z'
    },
    {
      $id: '2',
      domain: 'test-site.org',
      issued_date: '2023-06-15T00:00:00.000Z',
      expire_date: '2024-02-15T23:59:59.000Z',
      $createdAt: '2023-06-15T00:00:00.000Z',
      $updatedAt: '2023-06-15T00:00:00.000Z'
    },
    {
      $id: '3',
      domain: 'expired-domain.net',
      issued_date: '2022-03-10T00:00:00.000Z',
      expire_date: '2023-03-10T23:59:59.000Z',
      $createdAt: '2022-03-10T00:00:00.000Z',
      $updatedAt: '2022-03-10T00:00:00.000Z'
    },
    {
      $id: '4',
      domain: 'new-project.io',
      issued_date: '2024-01-01T00:00:00.000Z',
      expire_date: '2025-12-31T23:59:59.000Z',
      $createdAt: '2024-01-01T00:00:00.000Z',
      $updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      $id: '5',
      domain: 'warning-site.com',
      issued_date: '2023-11-01T00:00:00.000Z',
      expire_date: '2024-01-20T23:59:59.000Z',
      $createdAt: '2023-11-01T00:00:00.000Z',
      $updatedAt: '2023-11-01T00:00:00.000Z'
    }
  ]
};

/**
 * Mock statistics calculation based on domains
 */
const mockStatsResponse = {
  total: 5,
  active: 2,
  expiringSoon: 2,
  expired: 1
};

/**
 * Mock successful domain creation response
 */
const mockCreateDomainResponse = {
  $id: '6',
  domain: 'newly-added.com',
  issued_date: '2024-01-15T00:00:00.000Z',
  expire_date: '2025-01-15T23:59:59.000Z',
  $createdAt: '2024-01-15T10:30:00.000Z',
  $updatedAt: '2024-01-15T10:30:00.000Z'
};

/**
 * Mock error responses
 */
const mockErrorResponses = {
  networkError: {
    message: 'Failed to fetch domains: Network error',
    code: 'NETWORK_ERROR'
  },
  authError: {
    message: 'The current user is not authorized to perform the requested action.',
    code: 'UNAUTHORIZED'
  },
  validationError: {
    message: 'Invalid domain format',
    code: 'VALIDATION_ERROR'
  },
  notFoundError: {
    message: 'Domain not found',
    code: 'NOT_FOUND'
  }
};

/**
 * Mock user data for testing
 */
const mockUserResponse = {
  $id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  $createdAt: '2023-01-01T00:00:00.000Z',
  $updatedAt: '2023-01-01T00:00:00.000Z'
};

/**
 * Mock session data
 */
const mockSessionResponse = {
  $id: 'session123',
  userId: 'user123',
  expire: '2024-12-31T23:59:59.000Z',
  provider: 'anonymous',
  $createdAt: '2024-01-15T10:00:00.000Z'
};

/**
 * Generate mock domains for testing different scenarios
 */
function generateMockDomains(count = 5) {
  const domains = [];
  const now = new Date();
  
  for (let i = 1; i <= count; i++) {
    const issuedDate = new Date(now.getFullYear() - 1, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
    const expireDate = new Date(issuedDate.getTime() + (365 + Math.floor(Math.random() * 365)) * 24 * 60 * 60 * 1000);
    
    domains.push({
      $id: `domain${i}`,
      domain: `test-domain-${i}.com`,
      issued_date: issuedDate.toISOString(),
      expire_date: expireDate.toISOString(),
      $createdAt: issuedDate.toISOString(),
      $updatedAt: issuedDate.toISOString()
    });
  }
  
  return {
    total: count,
    documents: domains
  };
}

/**
 * Calculate mock statistics from domains
 */
function calculateMockStats(domains) {
  const now = new Date();
  let active = 0;
  let expiring = 0;
  let expired = 0;
  
  domains.forEach(domain => {
    const expireDate = new Date(domain.expire_date);
    const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (expireDate < now) {
      expired++;
    } else if (daysLeft <= 30) {
      expiring++;
    } else {
      active++;
    }
  });
  
  return {
    total: domains.length,
    active,
    expiringSoon: expiring,
    expired
  };
}

/**
 * Mock API interceptors for testing
 */
const mockApiInterceptors = {
  // Successful responses
  success: {
    listDomains: () => mockDomainsResponse,
    getStats: () => mockStatsResponse,
    createDomain: (data) => ({
      ...mockCreateDomainResponse,
      domain: data.domain,
      issued_date: data.issued_date,
      expire_date: data.expire_date
    }),
    getSession: () => mockSessionResponse
  },
  
  // Error responses
  errors: {
    networkError: () => { throw new Error(mockErrorResponses.networkError.message); },
    authError: () => { throw new Error(mockErrorResponses.authError.message); },
    validationError: () => { throw new Error(mockErrorResponses.validationError.message); },
    notFoundError: () => { throw new Error(mockErrorResponses.notFoundError.message); }
  }
};

export {
  mockDomainsResponse,
  mockStatsResponse,
  mockCreateDomainResponse,
  mockErrorResponses,
  mockUserResponse,
  mockSessionResponse,
  generateMockDomains,
  calculateMockStats,
  mockApiInterceptors
};
