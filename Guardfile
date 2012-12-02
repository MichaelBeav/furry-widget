# A sample Guardfile
# More info at https://github.com/guard/guard#readme

guard 'livereload' do
  # watch(%r{app/views/.+\.(erb|haml|slim)$})
  # watch(%r{app/helpers/.+\.rb})
  watch(%r{client/.+\.(css|js|mustache|html)})
  ignore(%r{.+\.(swo|swp)$})
  # watch(%r{config/locales/.+\.yml})
  # Rails Assets Pipeline
  # watch(%r{(app|vendor)(/assets/\w+/(.+\.(s[ac]ss|coffee|css|js|html))).*}) { |m| "/assets/#{m[3]}" }
end
