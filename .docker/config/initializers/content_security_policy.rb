Rails.application.config.content_security_policy do |p|
    p.default_src :self, :https
    p.font_src    :self, :https, :data
    p.img_src     :self, :https, :data
    p.object_src  :none
    p.script_src  :self, :https, :unsafe_eval
    p.style_src   :self, :https, :unsafe_inline
    p.connect_src :self, :https, 'http://localhost:3035', 'ws://localhost:3035'
  
    # Specify URI for violation reports
    # p.report_uri "/csp-violation-report-endpoint"
  end