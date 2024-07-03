import UAParser from 'ua-parser-js';
import dotenv from "dotenv";

dotenv.config();

const accessControl = (req, res, next) => {
    const userAgentString = req.headers['user-agent'];
    const parser = new UAParser();
    const agent = parser.setUA(userAgentString).getResult();

    const isGoogleChrome = agent.browser.name === 'Chrome';
    var isMobileDevice = false;

    if (agent.device.type) {
        isMobileDevice = userAgentString.includes('Mobile');
    }
    const isOTPValidated = req.headers['x-otp-validated'] === process.env.HEADER;

    req.deviceType = 'Other';

    if (isMobileDevice) {
        const currentHour = new Date().getHours();
        if (currentHour < 15 || currentHour > 20) {
            return res.status(403).json({ message: "Access restricted for mobile devices outside 10 AM to 1 PM." });
        }
        req.deviceType = 'Mobile';
    }

    if (isGoogleChrome) {
        if (isOTPValidated) {
            return next();
        } else {
            return res.status(401).json({ message: "OTP authentication required for Google Chrome users.", fromAccessControl: true });
        }
    } else {
        req.browserType = 'Other';
        return next();
    }
};

export default accessControl;