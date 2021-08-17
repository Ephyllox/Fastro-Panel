import { UserRole } from "../../enums";
import { UserLogin } from "../../types";

const Logins: { [name: string]: UserLogin } = {
    "admin": {
        id: 1,
        password: "asdasd",
        perms: {
            roles: [
                UserRole.ADMIN,
            ],
        },
    },
};

export default Logins;