export interface Domain {
  $id: string
  domain: string
  issued_date: string
  expire_date: string
  ssl_expire_date: string
  $createdAt: string
  $updatedAt: string
}

export interface DomainStats {
  total: number
  active: number
  expiringSoon: number
  expired: number
}

export interface CreateDomainData {
  domain: string
  issued_date: string
  expire_date: string
  ssl_expire_date: string
}
