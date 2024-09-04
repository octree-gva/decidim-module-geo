# frozen_string_literal: true

# spec/create_scope_type_spec.rb

require "spec_helper"

module Decidim
  module Admin
    describe CreateScopeType do
      let(:form) do
        double(
          "form",
          invalid?: false,
          name: "Test Scope",
          organization: "Test Organization",
          plural: "Test Plural",
          shapefile: 1
        )
      end

      let(:create_scope_type) { described_class.new(form) }

      describe "#call" do
        context "when the form is valid" do
          it "creates a scope type and broadcasts :ok" do
            allow(create_scope_type).to receive(:create_scope_type)
            expect(create_scope_type).to receive(:broadcast).with(:ok)

            create_scope_type.call
          end
        end

        context "when the form is invalid" do
          it "broadcasts :invalid" do
            allow(form).to receive(:invalid?).and_return(true)
            expect(create_scope_type).to receive(:broadcast).with(:invalid)

            create_scope_type.call
          end
        end
      end
    end
  end
end
