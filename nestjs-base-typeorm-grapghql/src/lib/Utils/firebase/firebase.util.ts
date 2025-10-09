import { FirebaseDynamicLinks } from 'firebase-dynamic-links';

const firebaseDynamicLinks = new FirebaseDynamicLinks(`${process.env.FIREBASE_API_KEY}`);

export const getDynamicLink = async (url: string) =>
    await firebaseDynamicLinks.createLink({
        dynamicLinkInfo: {
            domainUriPrefix: `${process.env.FIREBASE_APP_DOMAIN}`,
            link: url,
            androidInfo: {
                androidPackageName: `${process.env.ANDROID_PACKAGE_NAME}`,
            },
            iosInfo: {
                iosBundleId: `${process.env.IOS_BUILD_ID}`,
            },
        },
    });

export const linkEventStats = async (accessToken: string) =>
    await firebaseDynamicLinks.getLinkStats(`${process.env.FIREBASE_APP_DOMAIN}`, 7, accessToken)


