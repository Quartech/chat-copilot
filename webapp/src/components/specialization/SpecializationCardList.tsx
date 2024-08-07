import React, { useId } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { ISpecialization } from '../../libs/models/Specialization';
import { SpecializationCard } from './SpecializationCard';
import { makeStyles } from '@fluentui/react-components';
import '../../index.css';

const responsive = {
    // Define responsive settings for different screen sizes
    desktop: {
        breakpoint: { max: 3000, min: 1024 },
        items: 2,
        slidesToSlide: 2,
    },
    tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 2,
        slidesToSlide: 2,
    },
    mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1,
    },
};

const useClasses = makeStyles({
    innercontainerclass: {
        height: '330px',
    },
    innertitle: {
        textAlign: 'center',
    },
});

interface SpecializationProps {
    /* eslint-disable 
      @typescript-eslint/no-unsafe-assignment
    */
    specializations: ISpecialization[];
}

export const SpecializationCardList: React.FC<SpecializationProps> = ({ specializations }) => {
    const specializaionCarouselId = useId();
    const specializaionCardId = useId();
    const classes = useClasses();

    return (
        <div>
            <h1 className={classes.innertitle}>Choose Specialization</h1>
            <Carousel
                responsive={responsive}
                key={specializaionCarouselId}
                showDots={true}
                swipeable={true}
                arrows={true}
                dotListClass="custom-dot-list-style"
            >
                {specializations.map((_specialization, index) => (
                    <div key={index} className={classes.innercontainerclass}>
                        <SpecializationCard
                            key={specializaionCardId + '_' + index.toString()}
                            specialization={_specialization}
                        />
                    </div>
                ))}
            </Carousel>
        </div>
    );
};
