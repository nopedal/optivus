// Type declarations for global modules
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}