import React, { useState } from 'react';
import classNames from 'classnames';

import { useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import { formatMoney } from '../../../util/currency';
import { ensureListing } from '../../../util/data';
import { isPriceVariationsEnabled, requireListingImage } from '../../../util/configHelpers';

import { AspectRatioWrapper, ResponsiveImage, ListingCardThumbnail } from '../../../components';

import css from './SearchMapInfoCard.module.css';

// ListingCard is the listing info without overlayview or carousel controls
const ListingCard = props => {
  const { className, clickHandler, intl, isInCarousel, listing, urlToListing, config } = props;

  const { title, price, publicData } = listing.attributes;
  const { cardStyle } = publicData || {};
  const formattedPrice =
    price && price.currency === config.currency
      ? formatMoney(intl, price)
      : price?.currency
      ? price.currency
      : null;
  const firstImage = listing.images && listing.images.length > 0 ? listing.images[0] : null;

  const {
    aspectWidth = 1,
    aspectHeight = 1,
    variantPrefix = 'listing-card',
  } = config.layout.listingImage;
  const variants = firstImage
    ? Object.keys(firstImage?.attributes?.variants).filter(k => k.startsWith(variantPrefix))
    : [];

  const pricePerUnit = intl.formatMessage(
    { id: 'SearchMapInfoCard.perUnit' },
    { unitType: publicData?.unitType }
  );
  const priceValue = formattedPrice ? formattedPrice : '';

  const validListingTypes = config.listing.listingTypes;
  const foundListingTypeConfig = validListingTypes.find(
    conf => conf.listingType === publicData?.listingType
  );
  const showListingImage = requireListingImage(foundListingTypeConfig);
  const isPriceVariationsInUse = isPriceVariationsEnabled(publicData, foundListingTypeConfig);
  const hasMultiplePriceVariants = isPriceVariationsInUse && publicData?.priceVariants?.length > 1;

  const priceMessage = hasMultiplePriceVariants
    ? intl.formatMessage(
        { id: 'SearchMapInfoCard.priceStartingFrom' },
        { priceValue, pricePerUnit }
      )
    : intl.formatMessage({ id: 'SearchMapInfoCard.price' }, { priceValue, pricePerUnit });

  // listing card anchor needs sometimes inherited border radius.
  const classes = classNames(
    css.anchor,
    css.borderRadiusInheritTop,
    { [css.borderRadiusInheritBottom]: !isInCarousel },
    className
  );

  return (
    <a
      alt={title}
      className={classes}
      href={urlToListing}
      onClick={e => {
        e.preventDefault();
        // Use clickHandler from props to call internal router
        clickHandler(listing);
      }}
    >
      <div
        className={classNames(css.card, css.borderRadiusInheritTop, {
          [css.borderRadiusInheritBottom]: !isInCarousel,
        })}
      >
        {showListingImage ? (
          <AspectRatioWrapper
            className={css.aspectRatioWrapper}
            width={aspectWidth}
            height={aspectHeight}
          >
            <ResponsiveImage
              rootClassName={classNames(css.rootForImage, css.borderRadiusInheritTop)}
              alt={title}
              noImageMessage={intl.formatMessage({ id: 'SearchMapInfoCard.noImage' })}
              image={firstImage}
              variants={variants}
              sizes="250px"
            />
          </AspectRatioWrapper>
        ) : (
          <ListingCardThumbnail
            style={cardStyle}
            listingTitle={title}
            className={css.aspectRatioWrapper}
            width={aspectWidth}
            height={aspectHeight}
          />
        )}
        <div className={classNames(css.info, { [css.borderRadiusInheritBottom]: !isInCarousel })}>
          <div className={classNames(css.price, { [css.noPriceSetLabel]: !formattedPrice })}>
            {priceMessage}
          </div>
          <div className={css.name}>{title}</div>
        </div>
      </div>
    </a>
  );
};

/**
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} [props.rootClassName] - Custom class that extends the default class for the root element
 * @param {Array<propTypes.listing>} props.listings - The listings
 * @param {Function} props.onListingInfoCardClicked - The function to handle the listing info card click
 * @param {Function} props.createURLToListing - The function to create the URL to the listing
 * @param {Object} props.config - The configuration
 * @returns {JSX.Element}
 */
const SearchMapInfoCard = props => {
  const [currentListingIndex, setCurrentListingIndex] = useState(0);
  const intl = useIntl();
  const {
    className,
    rootClassName,
    listings,
    createURLToListing,
    onListingInfoCardClicked,
    config,
  } = props;
  const currentListing = ensureListing(listings[currentListingIndex]);
  const hasCarousel = listings.length > 1;

  const classes = classNames(rootClassName || css.root, className);
  const caretClass = classNames(css.caret, { [css.caretWithCarousel]: hasCarousel });

  return (
    <div className={classes}>
      <div className={css.caretShadow} />
      <ListingCard
        clickHandler={onListingInfoCardClicked}
        urlToListing={createURLToListing(currentListing)}
        listing={currentListing}
        intl={intl}
        isInCarousel={hasCarousel}
        config={config}
      />
      {hasCarousel ? (
        <div className={classNames(css.paginationInfo, css.borderRadiusInheritBottom)}>
          <button
            className={css.paginationPrev}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentListingIndex(
                prevListingIndex => (prevListingIndex + listings.length - 1) % listings.length
              );
            }}
          />
          <div className={css.paginationPage}>
            {`${currentListingIndex + 1}/${listings.length}`}
          </div>
          <button
            className={css.paginationNext}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentListingIndex(
                prevListingIndex => (prevListingIndex + listings.length + 1) % listings.length
              );
            }}
          />
        </div>
      ) : null}
      <div className={caretClass} />
    </div>
  );
};

export default SearchMapInfoCard;
