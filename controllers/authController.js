import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { signJwt } from "@/lib/jwt";
import { loginSchema, registerSchema } from "@/validators/authValidator";
import { loginUser, registerUser } from "@/services/authService";
import { getAuthUserFromRequest } from "@/lib/auth";
import { AppError } from "@/utils/errors";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function registerController(request, responseBuilder) {
  const body = await request.json();
  const payload = registerSchema.parse(body);
  const user = await registerUser(payload);

  if (user.requiresApproval) {
    return responseBuilder(
      {
        user,
        requiresApproval: true,
        message: "Seller account created. Please wait for admin approval before login.",
      },
      201
    );
  }

  const token = signJwt({ id: user.id, role: user.role });
  const response = responseBuilder(
    {
      token,
      user,
    },
    201
  );
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function loginController(request, responseBuilder) {
  const body = await request.json();
  const payload = loginSchema.parse(body);
  const user = await loginUser(payload);
  const token = signJwt({ id: user.id, role: user.role });
  const response = responseBuilder({ token, user });
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function logoutController(responseBuilder) {
  const response = responseBuilder({ loggedOut: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}

export async function meController(request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  if (!user) throw new AppError(401, "Unauthorized");
  return responseBuilder({ user });
}
