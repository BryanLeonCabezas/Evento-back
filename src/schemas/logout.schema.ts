import z from "zod/v3";

const logoutParamsSchema = z.object({
    idCliente: z.string()
});

export default logoutParamsSchema;