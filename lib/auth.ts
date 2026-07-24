interface LoginResponse {
  success: boolean;
  message?: string;
  user?: any;
  errors?: Record<string, string[]>;
  status?: number;
  data?: any;
}

interface SimpleResponse {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export const authClient = {
  /**
   * Login with membership_id instead of email
   */
  async login(membershipId: string, password: string): Promise<LoginResponse> {
    try {
      console.log("authClient.login called with:", {
        membershipId,
        password: "***",
      });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          membership_id: membershipId,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message,
          errors: data.errors,
          status: response.status,
          data: data.data,
        };
      }

      return {
        success: true,
        user: data.user,
        message: data.message,
      };
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  },

  async getCurrentUser(): Promise<any> {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      console.log(
        "authClient.getCurrentUser - Response status:",
        response.status,
      );

      if (!response.ok) {
        console.log("authClient.getCurrentUser - Not OK, returning null");
        return null;
      }

      const data = await response.json();
      console.log("authClient.getCurrentUser - Response data:", data);

      return data.data?.user || data.user || null;
    } catch (error) {
      console.error("authClient.getCurrentUser - Error:", error);
      return null;
    }
  },

  async checkAuth(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  },

  async getUserRole(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.role || null;
  },

  async isAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === "admin";
  },

  async isMember(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === "member";
  },

  async getMembershipId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.membership_id || null;
  },

  /**
   * Request a password reset link via email
   */
  async forgotPassword(email: string): Promise<SimpleResponse> {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message,
          errors: data.errors,
          status: response.status,
        };
      }

      return { success: true, message: data.message };
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset password using the token from the emailed link
   */
  async resetPassword(
    token: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<SimpleResponse> {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          token,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message,
          errors: data.errors,
          status: response.status,
        };
      }

      return { success: true, message: data.message };
    } catch (error) {
      throw error;
    }
  },
};
