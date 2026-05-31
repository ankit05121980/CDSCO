/** Shape of the principal attached to every authenticated request. */
export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

declare global {
   
  namespace Express {
    // Aligns Passport's `req.user` (Express.User) with our principal shape.
     
    interface User extends AuthenticatedUser {}
    interface Request {
      requestId?: string;
    }
  }
}
