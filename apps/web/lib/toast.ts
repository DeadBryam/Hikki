import { sileo } from "sileo";

interface ToastOptions {
  description: string;
  title?: string;
}

export const toast = {
  error: (params: ToastOptions) => {
    sileo.error({
      title: params.title,
      description: params.description,
    });
  },
  info: (params: ToastOptions) => {
    sileo.info({
      title: params.title,
      description: params.description,
    });
  },
  success: (params: ToastOptions) => {
    sileo.success({
      title: params.title,
      description: params.description,
    });
  },
  warning: (params: ToastOptions) => {
    sileo.warning({
      title: params.title,
      description: params.description,
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
};
