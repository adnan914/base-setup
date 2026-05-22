import { Injectable } from '@nestjs/common';

@Injectable()
export class ConstantConfig {
    role: {
        admin: "admin",
        manager: "manager",
        lead: "lead",
        employee: "employee"
        error: {
            informationError: 'User information is not available',
            requiredRoleError: 'User does not have the required role'
        }
    };
    generalMessages = {
        auth: {
            userCreated: "User Created Successfully",
            resetTokenSent: "Reset password token sent to email.",
            passwordReset: "Password successfully reset.",
            passwordChanged: "Password successfully changed.",
            userLogin: "User Login Successfully"

        }
    };

    error = {
        auth: {
            emailExists: "User with this email already exists",
            emailTaken: "Email has already been taken",
            userNotFound: "User not found",
            loginFailed: "Login failed",
            findByIdError: "Error finding user by ID :",
            updateProfileError: "You can only update your own profile",
            updateUserError: "Failed to update user",
            refreshTokenError: "Refresh token not provided",
            passwordMismatch: "Passwords do not match",
            invalidToken: 'Invalid Token',
            invalidTokenType: 'Invalid token type',
            invalidEmailPassword: 'Email or password is invalid',
            passwordMismatchNew: 'New password and confirm password do not match',
            incorrectCurrentPassword: 'Current password is incorrect',
            customerIdError: 'Error getting user ID by customer ID:',
            createUserError: "Failed to create user",
            validationFaield: 'User validation failed',
            invalidRefreshToken: 'Invalid refresh token',
            expiredRefreshToken: 'Invalid or expired refresh token',
            sendEmailError: 'Error while sending email',
            google: {
                emailNotFound: "Email not found in token payload.",
                invalidToken: 'Invalid or expired ID token',
                tokenExpiredError: 'Token used too late, please try again',
                idTokenError: 'ID token is missing'
            },
            facebook: {
                userDataError: 'Failed to fetch Facebook user data',
                failedToSave: 'Failed to save Facebook user',
                expiredAccessToken: 'Facebook access token is expired'
            },
            aws: {
                 presignedUrlsError: 'Error while generating presigned URLs',
                 deleteObjectS3Error: 'Error deleting object from S3',
                 urlError: 'Error generating URL',
                 wentWrong:'Something went wrong.',
            },
            firebase: {
                failedToGenerateFcm:'Failed to generate FCM token'
            },
        },
        attendance: {
            exists: 'Attendance for the given date already exists',
            userAndAttendance: 'Attendance user with the same user ID and attendance ID already exists',
            notFound: 'Attendance user not found',
            markingUser: 'Marking user not found',
            unauthorized: 'You are not an authorized person',
            attendaceNotFound: 'Attendance not found with ID',
            userNotFound: 'User is not found with Id',
        },
        stripe: {
            couponError: 'Failed to create coupon',
            CouponNotFoundError: 'Coupon not found',
            cardNotFoundError: 'Card not found',
            createSubscriptionError: 'An error occurred while creating the subscription.',
            listingSubscriptionError: 'An error occurred while listing subscriptions.',
            cancelSubscriptionError: 'An error occurred while canceling the subscription.',
            subscriptionNotFoundError: 'Subscription not found.',
            userNotFoundError: "User not found with this email. Please create the user first.",
            userNotFoundByIdError: "User not found with this customer ID. Please create the user first.",
            customerAvailabelError: 'Failed to create customer. Please try again later.',
            customerIdAvailableError: "Customer ID already exists for this user.",
            customerNotFound: "Customer not found"
        },
        twilio: {
            unableToSendSms:"Unable to send message!",
            missingVariable:"You are missing one of the variables you need to send a message"

        }
    };
    
}
