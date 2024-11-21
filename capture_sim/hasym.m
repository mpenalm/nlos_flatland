function h = hasym(at,ax,varargin)
if ~exist('ax','var')
    ax = gca;
end
h = plot(ax, xlim(ax), [at' at'], varargin{:});