# spec/create_scope_type_spec.rb

require 'spec_helper'

module Decidim
  module Admin
    describe CreateScopeType do
      let(:form) do
        double(
          'form',
          invalid?: false,
          name: 'Test Scope',
          organization: 'Test Organization',
          plural: 'Test Plural',
          shapefile: 1
        )
      end

      let(:create_scope_type) { described_class.new(form) }

      describe '#call' do
        context 'when the form is valid' do
          it 'creates a scope type and broadcasts :ok' do
            allow(create_scope_type).to receive(:create_scope_type)
            expect(create_scope_type).to receive(:broadcast).with(:ok)

            create_scope_type.call
          end
        end

        context 'when the form is invalid' do
          it 'broadcasts :invalid' do
            allow(form).to receive(:invalid?).and_return(true)
            expect(create_scope_type).to receive(:broadcast).with(:invalid)

            create_scope_type.call
          end
        end
      end

      describe '#create_scope_type' do
        it 'creates a scope type with the form data' do
          allow(ScopeType).to receive(:create!).and_return(double('scope_type', save!: nil))
          allow(create_scope_type).to receive(:shapefile).and_return(double('shapefile'))
          
          expect(ScopeType).to receive(:create!).with(
            name: 'Test Scope',
            organization: 'Test Organization',
            plural: 'Test Plural'
          )

          create_scope_type.send(:create_scope_type)
        end

        it 'sets the shapefile for the created scope type' do
          allow(ScopeType).to receive(:create!).and_return(double('scope_type', save!: nil))
          allow(create_scope_type).to receive(:shapefile).and_return(double('shapefile'))
          allow(ScopeType).to receive(:find_by_id).and_return(double('shapefile'))

          expect_any_instance_of(ScopeType).to receive(:shapefile=).with(double('shapefile'))
          
          create_scope_type.send(:create_scope_type)
        end
      end

      describe '#shapefile' do
        it 'finds and returns the shapefile based on the form data' do
          allow(Decidim::Geo::Shapefile).to receive(:find_by_id).with(1).and_return(double('shapefile'))
          expect(create_scope_type.send(:shapefile)).to eq double('shapefile')
        end
      end
    end
  end
end
