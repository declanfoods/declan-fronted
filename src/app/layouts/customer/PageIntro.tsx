import type { PropsWithChildren, ReactNode } from 'react';

type PageIntroProps = PropsWithChildren<{
  title: string;
  description: ReactNode;
  showIntroOnMobile?: boolean;
}>;

export default function PageIntro({ title, description, showIntroOnMobile, children }: PageIntroProps) {
  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:items-end lg:gap-8 lg:rounded-[2rem] lg:bg-[#f3f5eb] lg:px-10 lg:py-9">
      <div className={showIntroOnMobile ? undefined : 'hidden lg:block'}>
        <h1 className="text-2xl font-bold text-primary lg:text-[2.75rem] lg:font-extrabold lg:leading-tight lg:tracking-[-0.045em] lg:text-[#153526] xl:text-[3.25rem]">
          {title}
        </h1>
        <div className="mt-1 text-sm text-primary lg:mt-2 lg:text-base lg:text-[#42594a]">
          {description}
        </div>
      </div>
      {children}
    </div>
  );
}
