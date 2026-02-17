import { sileo } from "sileo";

export const toast = {
  error: (message: string, description?: string) => {
    sileo.error({
      description,
      title: message,
    });
  },
  info: (message: string, description?: string) => {
    sileo.info({
      description,
      title: message,
    });
  },
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T> =>
    sileo.promise(promise, {
      error: { title: messages.error },
      loading: { title: messages.loading },
      success: { title: messages.success },
    }),
  success: (message: string, description?: string) => {
    sileo.success({
      description,
      title: message,
    });
  },
  warning: (message: string, description?: string) => {
    sileo.warning({
      description,
      title: message,
    });
  },
};
