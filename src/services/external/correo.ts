import axios from "axios";
import https from "https";
import fs from "fs";

const APEX_BASE_URL = "https://erp.uees.edu.ec/ords/ctsi";

const httpsAgent = new https.Agent({
   rejectUnauthorized: false,
});

export const sendVerificationEmail = async (data: {
  correo: string;
  nombre: string;
  linkVerification: string;
}) => {
  try {
    const response = await axios.post(
      `${APEX_BASE_URL}/cuenta/verificar`,
      data,
      {
        httpsAgent,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error enviando correo APEX:",
      error?.response?.data || error.message
    );
    throw new Error("Error enviando correo de verificación");
  }
};