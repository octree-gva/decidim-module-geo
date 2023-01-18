function createMarker({ title, description, location, href }) {
  return L.marker(location).bindPopup(
    `
    <div class="decidimGeo__popup__container">
      <div class="decidimGeo__popup__content">
        <div class="card__header">
          <a class="card__link" href="${href}">
            <div class="card__title">
              ${title}
            </div>
          </a>
          <div class="author-data">
            <div class="author-data__main">
              <div class="author author--inline">
              <span class="author__avatar">
                <img alt="Avatar: {AUTHOR_NAME}" src="/decidim-packs/media/images/default-avatar-aaa9e55bac5d7159b847.svg">
              </span>
              <span class="author__name">
                {AUTHOR_NAME}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="card__text">
        <div class="card__text--paragraph">
          <div>${description}</div>
        </div>
      </div>
      <ul class="tags tags--meeting">
        <li><a title="{t(Filter results for category:)} {TAG[0]}" href="${href}?filter%5Bcategory_id%5D%5B%5D=${"[0]"}"><span class="show-for-sr">{TAG[0]}</span><span aria-hidden="true">{TAG[0]}</span></a></li>
      </ul>
    </div>
    <div class="decidimGeo__popup__icondata">
      <ul class="card-data">
        <li class="decidimGeo__popup__meetingIcon">
          <svg aria-label="{t(Date)}" role="img" class="icon--datetime icon icon--big"><title>{t(Date)}</title><use href="/decidim-packs/media/images/icons-c4fd0f43651700b0c768.svg#icon-datetime"></use></svg>
        </li>
        <li class="decidimGeo__popup__meetingPeriod">
          <div>
            <strong>
              {START_DATE}
            </strong>
            {START_TIME}
          </div>
          <svg aria-label="arrow-thin-right" role="img" aria-hidden="true" class="icon--arrow-thin-right icon icon--big muted"><title>arrow-thin-right</title><use href="/decidim-packs/media/images/icons-c4fd0f43651700b0c768.svg#icon-arrow-thin-right"></use></svg>
          <div>
            <strong>
              {END_DATE}
            </strong>
            {END_TIME}
          </div>
        </li>
      </ul>
    </div>
  </div>`
  );
}

export default createMarker;
