# frozen_string_literal: true

# This validator takes care of ensuring the validated content is
# an existing address and computes its coordinates.
class GeocodingValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)

    component = record.respond_to?(:component) ? record.component : record
    
    if Decidim::Map.available?(:geocoding)
      geocoder = geocoder_for(component.organization)
      coordinates = geocoder.coordinates(value)

      if coordinates.present?
        record.latitude = coordinates.first
        record.longitude = coordinates.last
      else
        record.errors.add(attribute, :invalid)
      end
    else
      record.errors.add(attribute, :invalid)
    end
  end

  private

  def geocoder_for(organization)
    Decidim::Map.geocoding(organization: organization)
  end
end
