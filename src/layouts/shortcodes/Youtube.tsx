import { useEffect } from "react";

const Youtube = ({
  id,
  title,
  ...rest
}: {
  id: string;
  title: string;
  [key: string]: any;
}) => {
  useEffect(() => {
    import("@justinribeiro/lite-youtube");
  }, []);

  return (
    // @ts-expect-error: the lite-youtube custom element is registered at runtime.
    <lite-youtube
      className="rounded-lg"
      videoid={id}
      videotitle={title}
      {...rest}
    />
  );
};

export default Youtube;
