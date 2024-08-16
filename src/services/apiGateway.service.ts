import { ServiceSchema } from "moleculer";
import ApiGwService from "moleculer-web";
import { verifyToken } from "../jwtUtils";

const ApiGateWayService: ServiceSchema = {
  name: "ApiGateway",
  mixins: [ApiGwService],
  settings: {
    port: process.env.APIGATEWAY_PORT || 8000,
    routes: [
      {
        path: "/api",
        use: [
          function (req, res, next) {

            if (req.url === "/login" || req.url === "/register") {
              return next();
            }

            const authHeader = req.headers["authorization"];
            if (!authHeader) {
              res.writeHead(401, { "Content-Type": "text/plain" });
              return res.end("Authorization header not found");
            }

            const token = authHeader.split(" ")[1];
            if (!token) {
              res.writeHead(401, { "Content-Type": "text/plain" });
              return res.end("Token not found");
            }

            try {
              const decoded = verifyToken(token);
              req.$ctx.meta.user = decoded;
              next();
            } catch (err) {
              console.log("Invalid or expired token for:", req.url);
              res.writeHead(401, { "Content-Type": "text/plain" });
              return res.end("Invalid or expired token");
            }
          }
        ],
        aliases: {
          "POST /submitPermit": "permitApproval.submit",
          "POST /reviewPermit": "permitApproval.review",
          "POST /approvePermit": "permitApproval.approve",
          "POST /rejectPermit": "permitApproval.reject",
          "GET /getPermitStatus/:permitId": "permitApproval.getPermitStatus",
          "GET /getAllPermits": "permitApproval.getAllPermits",
          "POST /register": "userService.register",
          "POST /login": "userService.login",
        },
        onError(req, res, err): void {
          this.logger.error(`Error in API Gateway: ${err.name}`, err.message);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        }
      }
    ]
  },
  async started(): Promise<void> {
    this.logger.info("ApiGateway started!");
  }
};

export = ApiGateWayService;
