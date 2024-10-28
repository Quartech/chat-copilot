export {};

declare global {
    interface Window {
        _env_: ENVType;
    }
}

interface ENVType {
    // Add New Runtime Variables here
    REACT_APP_BACKEND_URI: string;
    REACT_APP_ENVIRONMENT: string;
    // The security group the user must have in order to access the site
    SECURITY_GROUP_ID: string;
}
