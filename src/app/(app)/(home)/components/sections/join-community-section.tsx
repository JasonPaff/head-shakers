import { HeartIcon, TrendingUpIcon, UsersIcon } from 'lucide-react';

export const JoinCommunitySection = () => {
  return (
    <section className={'bg-card px-4 py-16 md:py-20'}>
      <div className={'container mx-auto max-w-6xl'}>
        {/* Call to Action Card */}
        <div
          className={`overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100/60 via-orange-100/40
            to-orange-200/50 p-8 shadow-lg md:p-12 dark:from-amber-700/40 dark:via-orange-700/30
            dark:to-orange-800/35`}
        >
          <div className={'mb-10 text-center'}>
            <h2 className={'mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl'}>
              Join the Community
            </h2>
            <p className={'mx-auto max-w-2xl text-muted-foreground'}>
              Connect with fellow collectors, share your finds, and discover new additions to your collection.
            </p>
          </div>

          {/* Feature Cards */}
          <div className={'grid gap-6 md:grid-cols-3 md:gap-8'}>
            {/* Connect Card */}
            <div
              className={`rounded-2xl bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm
                transition-all duration-300 hover:shadow-md`}
            >
              <div
                className={`mx-auto mb-4 flex size-16 items-center justify-center rounded-full
                  bg-amber-100/70 shadow-sm`}
              >
                <UsersIcon aria-hidden={'true'} className={'size-8 text-amber-700'} />
              </div>
              <h3 className={'mb-2 text-lg font-semibold text-foreground'}>Connect</h3>
              <p className={'text-sm text-muted-foreground'}>
                Follow other collectors and build your network
              </p>
            </div>

            {/* Discover Card */}
            <div
              className={`rounded-2xl bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm
                transition-all duration-300 hover:shadow-md`}
            >
              <div
                className={`mx-auto mb-4 flex size-16 items-center justify-center
                  rounded-full bg-orange-100/70 shadow-sm`}
              >
                <TrendingUpIcon aria-hidden={'true'} className={'size-8 text-orange-600'} />
              </div>
              <h3 className={'mb-2 text-lg font-semibold text-foreground'}>Discover</h3>
              <p className={'text-sm text-muted-foreground'}>
                Find trending bobbleheads and rare collectibles
              </p>
            </div>

            {/* Share Card */}
            <div
              className={`rounded-2xl bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm
                transition-all duration-300 hover:shadow-md`}
            >
              <div
                className={`mx-auto mb-4 flex size-16 items-center justify-center
                  rounded-full bg-orange-200/70 shadow-sm`}
              >
                <HeartIcon aria-hidden={'true'} className={'size-8 text-orange-700'} />
              </div>
              <h3 className={'mb-2 text-lg font-semibold text-foreground'}>Share</h3>
              <p className={'text-sm text-muted-foreground'}>Showcase your collection and get feedback</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
