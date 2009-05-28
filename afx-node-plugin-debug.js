YUI.add("afx-node-plugin", function(Y) { 


	var NodeAFX=function(config){ 
		NodeAFX.superclass.constructor.apply(this,arguments);
		this.addAtt("delay", { value: config.delay || false });
		this.addAtt("ghost", { value: config.ghost || false });
		this.addAtt("bind", { value: config.bind });
	};
	NodeAFX.NAME="nodeafx";
	NodeAFX.NS="afx";

	var afx = (function() { 
	    //Animation attribute methods
	    var _attrs = [];
		function addAttributes(attrs) {  
	        for(var key in attrs) {  
	            this.addAtt(key, { value: attrs[key] }); 
	            _attrs.push(key);
	        }
	    };
	    function removeAttributes() {
	        for(var i = 0, len = _attrs.length; i < len; i++) { 
	            var attrName = _attrs[i];
	            this.removeAtt(attrName);
	        }
	    };
	    
	    //Node styling methods
	    function styleNode(styles) { 
	        var node = this.get("node");
	        for(var prop in styles) { node.setStyle(prop, styles[prop]); }
	    };
	    
	    //Animation state methods
	    function setUpPreState(fn) { 
	        return fn.call(this);
	    };
	    function setUpPostState(fn) { 
	        var onEnd = function() {  
	            this.unsubscribe("end", onEnd);
	            fn.call(this); 
	        };
	        this.on("end", onEnd, this);  
	    };
	    function animate(f, t, e) { 
	        var from = this.get("from") || {}, to = this.get("to") || {}, easing = e || Y.Easing.easeOut;
		    from = Y.merge(f); to = Y.merge(t); 
		    this.set("from", from); this.set("to", to); this.set("easing", easing);
		    if(!this.get("delay")) { this.run(); }
	    };

		function perform(anim) { 
			addAttributes.call(this, anim.attributes);
			styleNode.call(this, anim.styles);
			
			var preState = setUpPreState.call(this, anim.preState);
			setUpPostState.call(this, anim.postState);
			animate.call(this, preState.from, preState.to, preState.easing);
		};
		
	    return {  
	        hide: function() { this.get("node").setStyle("display", "none").setStyle("visibility", "none"); },
	        show: function() { this.get("node").setStyle("display", "block").setStyle("visibility", "visible"); }, 
		    highlight: function(a) { 
				perform.call(this, { 
					attributes: {}, 
					styles: { }, 
					preState: function() { 
						return { 
							from: { backgroundColor: "#FFFB52" }, 
							to: { backgroundColor: this.get("node").getStyle("backgroundColor") } 
						};
					}, 
					postState: function() { 
						if(a) { a.call(this.get("node")); }
					}
				}); 
		    }, 
		    fade: function(a) {   
				perform.call(this, { 
					attributes: { }, 
					styles: { }, 
					preState: function() {  return { from: { opacity: 1 }, to: { opacity: 0 } }; }, 
					postState: function() {  if(a) { a.call(this.get("node")); } }
				}); 
		    },
		    appear: function(a) { 
				perform.call(this, { 
					attributes: { }, 
					styles: { opacity: 0 }, 
					preState: function() {   
						this.show();
						
						return { from: { opacity: 0 }, to: { opacity: 1 } }; 
					}, 
					postState: function() { if(a) { a.call(this.get("node")); } }
				});  
		    }, 
		    blindUp: function(a) {   
				perform.call(this, { 
					attributes: {   
		                origHeight: parseInt(this.get("node").getStyle("height")), 
		                origTop: parseInt(this.get("node").getStyle("top"))
					}, 
					styles: { overflow: "hidden" }, 
					preState: function() { 
						var from = {}, to = {};
			            from.height = this.get("origHeight") + "px"; 
			            to.height = "0px";
			            if(this.get("ghost")) { from.opacity = 1; to.opacity = 0; }
			            
			            if(this.get("bind") === "bottom") { 
			                styleNode.call(this, { height: "0px", top: this.get("origHeight") + "px" });
			                
			                from.height = "0px"; 
			                to.height = this.get("origHeight") + "px";
			                from.top = this.get("origTop") + this.get("origHeight") + "px";
			                to.top = this.get("origTop") + "px";
		                    if(this.get("ghost")) { from.opacity = 0; to.opacity = 1; }
			            }
						
						return { from: from, to: to };
					}, 
					postState: function() { 
		                if(this.get("bind") === "bottom") { 
		                    styleNode.call(this, { top: this.get("origTop") + "px" }); 
		                } else { 
		                    this.hide();    
		                    styleNode.call(this, { height: this.get("origHeight") + "px" });
		                } 
			            
			            //Here's where one adds tack on animation
						if(a) { a.call(this.get("node")); }
					}
				});
		    }, 
		    blindDown: function(a) {   
				perform.call(this, { 
					attributes: {   
		                origHeight: parseInt(this.get("node").getStyle("height")), 
		                origTop: parseInt(this.get("node").getStyle("top"))
		            }, 
					styles: { overflow: "hidden" }, 
					preState: function() { 
						var from = {}, to = {};
			            from.height = 0;
			            to.height = this.get("origHeight") + "px"
			            if(this.get("ghost")) { from.opacity = 0; to.opacity = 1; }
			            
			            if(this.get("bind") === "bottom") {  
			                from.height = this.get("origHeight") + "px"; 
			                to.height = "0px";
			                from.top = this.get("origTop");
			                to.top = this.get("origTop") + this.get("origHeight");
		                    if(this.get("ghost")) { from.opacity = 1; to.opacity = 0; }
			            } else { styleNode.call(this, { height: "0px" }); }
						
						return { from: from, to: to };
					}, 
					postState: function() { 
			            if(this.get("bind") === "bottom") { 
			                this.hide();
			                styleNode.call(this, { 
			                    top: this.get("origTop") + "px", 
			                    height: this.get("origHeight") + "px", 
			                    opacity: 1 
			                });
			            } else { 
			                styleNode.call(this, { opacity: 1 });
			            }
			            
			            //Here's where one adds tack on animation
						if(a) { a.call(this.get("node")); }
					}
				});
		    }, 
		    blindRight: function(a) {   
				perform.call(this, { 
					attributes: {  
		                origWidth: parseInt(this.get("node").getStyle("width")), 
		                origLeft: parseInt(this.get("node").getStyle("left"))
		            }, 
					styles: { overflow: "hidden" }, 
					preState: function() { 
						var from = {}, to = {};
			            from.width = 0;
			            to.width = this.get("origWidth") + "px";
			            if(this.get("ghost")) { from.opacity = 0; to.opacity = 1; }
			            
			            if(this.get("bind") === "right") {  
			                from.width = this.get("origWidth") + "px"; to.width = "0px";
			                from.left = this.get("origLeft");
			                to.left = this.get("origLeft") + this.get("origWidth");
		                    if(this.get("ghost")) { from.opacity = 1; to.opacity = 0; }
			            } else { styleNode.call(this, { width: "0px" }); }
						
						return { from: from, to: to };
					}, 
					postState: function() { 
			            if(this.get("bind") === "right") { 
			                this.hide();
			                styleNode.call(this, { 
			                    left: this.get("origLeft") + "px", 
			                    width: this.get("origWidth") + "px", 
			                    opacity: 1
			                });
			            } else { 
			                styleNode.call(this, { opacity: 1 });
			            }
			            
			            //Here's where one adds tack on animation
						if(a) { a.call(this.get("node")); }
					}
				}); 
		    }, 
		    blindLeft: function(a) {  
				perform.call(this, { 
					attributes: {   
		                origWidth: parseInt(this.get("node").getStyle("width")), 
		                origLeft: parseInt(this.get("node").getStyle("left"))
					}, 
					styles: { overflow: "hidden" }, 
					preState: function() { 
						var from = {}, to = {};
			            from.width = this.get("origWidth") + "px";
			            to.width = "0px";
			            if(this.get("ghost")) { from.opacity = 1; to.opacity = 0; }
			            
			            if(this.get("bind") === "right") { 
			                this.hide();
			                styleNode.call(this, { width: "0px", left: this.get("origWidth") + "px" });
			                if(this.get("ghost")) { 
			                    styleNode.call(this, { opacity: 0 }); 
		                        from.opacity = 0; to.opacity = 1; 
		                    }
		                    this.show();
		                    from.height = "0px"; to.height = this.get("origWidth") + "px";
			                from.left = this.get("origLeft") + this.get("origWidth") + "px";
			                to.left = this.get("origLeft") + "px"; 
			            }
						
						return { from: from, to: to };
					}, 
					postState: function() { 
			            if(this.get("bind") === "right") { 
			            
			            } else { 
			                this.hide();
			                styleNode.call(this, { 
			                    left: this.get("origLeft") + "px", 
			                    width: this.get("origWidth") + "px", 
			                    opacity: 1
			                });
			            } 
			            
			            //Here's where one adds tack on animation
						if(a) { a.call(this.get("node")); }
					}
				});
		    }, 
		    fold: function(a) {   
				perform.call(this, { 
					attributes: {   
		                origHeight: parseInt(this.get("node").getStyle("height")), 
		                origWidth: parseInt(this.get("node").getStyle("width")) 
		            }, 
					styles: { overflow: "hidden" }, 
					preState: function() { 
						if(!this.get("delay")) { this.show(); }
							
						return { from: { height:this.get("origHeight") + "px" }, to: { height: "5px"} };
					}, 
					postState: function() { 
						perform.call(this, { 
							attributes: {}, 
							styles: {}, 
							preState: function() { 
								var from = {}, to = {};
			                    from.height = this.get("to").height;
			                    from.width = this.get("origWidth") + "px";
			                    to.width = "0px";
			                    if(this.get("ghost")) { from.opacity = 1; to.opacity = 0; } 
								
								return { from: from, to: to };
							}, 
							postState: function() { 
			    	            this.hide();
			    	            styleNode.call(this, { height: this.get("origHeight") + "px", width: this.get("origWidth") + "px" });
				                
								if(a) { a.call(this.get("node")); }
							}
						});
					}
				}); 
		    }, 
		    unFold: function(a) {   
		        this.hide();
				
				perform.call(this, { 
					attributes: {   
		                origHeight: parseInt(this.get("node").getStyle("height")), 
		                origWidth: parseInt(this.get("node").getStyle("width")) 
		            }, 
					styles: { height: "0px", width: "0px", overflow: "hidden" }, 
					preState: function() { 
						this.show();
						
						var from = {}, to = {};
			            from.height = "0px"; from.width = "0px";
			            to.height = "5px"; to.width = this.get("origWidth") + "px";
			            if(this.get("ghost")) { from.opacity = 0; to.opacity = .15; }
					
						return { from: from, to: to };
					}, 
					postState: function() { 
						perform.call(this, { 
							attributes: {}, 
							styles: {}, 
							preState: function() { 
								var eFrom = {}, eTo = {};
				                eFrom.height = this.get("to").height;
				                eFrom.width = this.get("origWidth") + "px";
			                    eTo.height = this.get("origHeight") + "px";
			                    eTo.width = this.get("origWidth") + "px";
			                    if(this.get("ghost")) { eFrom.opacity = .15; eTo.opacity = 1; } 
								
								return { from: eFrom, to: eTo };
							}, 
							postState: function() { 
								if(a) { a.call(this.get("node")); }
							}
						});
					}
				});
		    }, 
		    shakeLR: function(a) {  
				perform.call(this, { 
					attributes: {   
		                done: false, 
		                offset: 10, 
		                maxCount: 5, 
		                counter: 0, 
		                post: this.get("node").getXY()
		            }, 
					styles: { }, 
					preState: function() { 
			    	    this.set("duration", .25);
			    	    return { from:{}, to: { left: - this.get("offset") } };
					}, 
					postState: function() { 
						var onTick = function() {  
							var eTo = {};
							if(this.get("counter") < this.get("maxCount")) { 
								this.set("counter", this.get("counter")+1);
								
								if(this.get("left")) { 
									this.removeAtt("left");
									eTo.left = - this.get("offset");
								} else { 
									this.addAtt("left", { value: true });
									eTo.left = this.get("offset");
								}
							} else {
								this.set("done", true);
								this.removeAtt("left");
								this.removeAtt("counter");
								eTo.left = 0;
							}
							return { from: {}, to: eTo };
						};
						var onEnd = function() {   
							if(this.get("done")) { 
								if(a) { a.call(this.get("node")); }
							} else {  
								perform.call(this, {
									attributes: {}, 
									styles: {}, 
									preState: onTick, 
									postState: onEnd
								});  
							}
						};
						perform.call(this, {
							attributes: {}, 
							styles: {}, 
							preState: onTick, 
							postState: onEnd
						}); 
					}
				}); 
		    }, 
		    shakeTB: function(a) {  
				perform.call(this, { 
					attributes: {   
		                done: false, 
		                offset: 10, 
		                maxCount: 5, 
		                counter: 0, 
		                post: this.get("node").getXY()
		            }, 
					styles: { }, 
					preState: function() { 
						this.set("duration", .25);
						return { from: {}, to: { top: - this.get("offset") } };
					}, 
					postState: function() {  
		    	        var onTick = function() {  
							var eTo = {};
			                if(this.get("counter") < this.get("maxCount")) { 
			                    this.set("counter", this.get("counter")+1);
		        	            
		    	                if(this.get("top")) { 
		    	                    this.removeAtt("top");
		    	                    eTo.top = - this.get("offset");
		    	                } else { 
		    	                    this.addAtt("top", { value: true });
		    	                    eTo.top = this.get("offset");
		    	                }
			                } else {
			                    this.set("done", true);
			                    this.removeAtt("top");
			                    this.removeAtt("counter");
			                    eTo.top = 0;
			                }
							return { from: {}, to: eTo };
		    	        };
		    	        
		    	        var onEnd = function() {   
		    	            if(this.get("done")) {  
								if(a) { a.call(this.get("node")); }
		                    } else {   
								perform.call(this, { 
									attributes: {},
									styles: {}, 
									preState: onTick, 
									postState: onEnd
								}); 
		    	            }
			            };
						perform.call(this, { 
							attributes: {},
							styles: {}, 
							preState: onTick, 
							postState: onEnd
						}); 
					}
				}); 
		    }, 
		    drop: function(a) { 
				perform.call(this, { 
					attributes: {   
		                origHeight: parseInt(this.get("node").getStyle("height")), 
		                origTop: parseInt(this.get("node").getStyle("top"))
		            }, 
					styles: { }, 
					preState: function() { 
						return { from: { top: this.get("origTop"), opacity: 1 }, to: { top: this.get("origTop") + this.get("origHeight"), opacity: 0 }, easing: Y.Easing.easeIn };
					}, 
					postState: function() { 
			            styleNode.call(this, { top: this.get("origTop") + "px", opacity: 1 });
						
						if(a) { a.call(this.get("node")); }
					}
				}); 
		    }, 
		    pulse: function(a) {  
				perform.call(this, { 
					attributes: {   
		                done: false, 
		                maxCount: 9, 
		                counter: 0
		            }, 
					styles: { }, 
					preState: function() { 
						this.set("duration", .25); 
			    	    
						return { from:{ opacity: 1 }, to: { opacity: 0 }, easing: Y.Easing.easeIn };
					}, 
					postState: function() { 
			            var onTick = function() { 
							var eTo = {};
		    	            if(this.get("counter") < this.get("maxCount")) { 
		    	                this.set("counter", this.get("counter") + 1);
		    	                if(this.get("on")) { 
		    	                    this.removeAtt("on");
		    	                    eTo.opacity = 0;
		    	                } else { 
		    	                    this.addAtt("on", { value: true });
		    	                    eTo.opacity = 1;
		    	                }
		    	            } else { 
		    	                this.set("done", true);
		    	                this.removeAtt("on");
		    	                this.removeAtt("counter");
		    	                eTo.opacity = 1;
		    	            }
							
							return { from: {}, to: eTo };
			            };
			            var onEnd = function() {
			                if(this.get("done")) {   
								if(a) { a.call(this.get("node")); }
			                } else {
								perform.call(this, { 
									attributes: {}, 
									styles: {}, 
									preState: onTick,
									postState: onEnd
								});  
			                }  
			            };
						
						perform.call(this, { 
							attributes: {}, 
							styles: {}, 
							preState: onTick,
							postState: onEnd
						}); 
					}
				}); 
		    }, 
		    shrink: function(a) {    
				perform.call(this, { 
					attributes: {   
		                origHeight: parseInt(this.get("node").getStyle("height")), 
		                origWidth: parseInt(this.get("node").getStyle("width"))
		            }, 
					styles: { overflow: "hidden" }, 
					preState: function() { 
						return { from: { fontSize:"100%" , opacity:1 }, to: {  fontSize:"0%" , height:0, width:0, opacity: 0 } };
					}, 
					postState: function() { 
		                this.hide();  
		                
		                styleNode.call(this, { 
		                    opacity: 1, 
		                    fontSize: "100%", 
		                    height: this.get("origHeight") + "px", 
		                    width: this.get("origWidth") + "px" 
		                });
		                
		                //Here's where one adds tack on animation
						if(a) { a.call(this.get("node")); }
					}
				}); 
		    }, 
		    grow: function(a) {  
				perform.call(this, { 
					attributes: {   
		                origHeight: parseInt(this.get("node").getStyle("height")), 
		                origWidth: parseInt(this.get("node").getStyle("width"))
		            }, 
					styles: { overflow: "hidden" }, 
					preState: function() { 
						return { from: { fontSize:"0%", opacity:0, height:0, width: 0}, to: { fontSize: "100%", opacity:1, height: this.get("origHeight"), width: this.get("origWidth") } };
					}, 
					postState: function() { 
						if(a) { a.call(this.get("node")); }
					}
				}); 
		    }, 
		    tv: function(a) {
				perform.call(this, { 
					attributes: {   
		                origHeight: parseInt(this.get("node").getStyle("height")), 
		                origWidth: parseInt(this.get("node").getStyle("width"))
		            }, 
					styles: { overflow: "hidden" }, 
					preState: function() { 
						return { from: { top:0 }, to: { top: (this.get("origHeight")/2), height:5 }, easing: Y.Easing.easeIn };
					}, 
					postState: function() { 
						perform.call(this, { 
							attributes: {}, 
							styles: {},
							preState: function() { 
								return { 
											from: { top:(this.get("origHeight")/2), left:0, height:5, opacity:1 }, 
											to: { top:(this.get("origHeight")/2), left:(this.get("origWidth")/2), height:5, width:5, opacity: 0 }, 
											easing: Y.Easing.easeIn
										};
							}, 
							postState: function() {  
			                    this.hide();
			                    styleNode.call(this, { 
			                        height: this.get("origHeight") + "px", 
			                        width: this.get("origWidth") + "px", 
			                        top: "", 
			                        left: "", 
			                        opacity: 1
			                    }); 
			                    //Here's where one adds tack on animation
								if(a) { a.call(this.get("node")); }
							}
						}); 
					}
				}); 
		    }, 
		    shadow: function(a) { 
	    	    perform.call(this,  {
					attributes: {}, 
					styles: {}, 
					preState: function() { return { from: {}, to: {} }; }, 
					postState: function() { if(a) { a.call(this.get("node")); } }
				});
		    }, 
		    puff: function(a) {
				perform.call(this, { 
					attributes: { 
		                origHeight: parseInt(this.get("node").getStyle("height")), 
		                origWidth: parseInt(this.get("node").getStyle("width")), 
		                origTop: parseInt(this.get("node").get("offsetTop")), 
		                origLeft: parseInt(this.get("node").get("offsetLeft"))
		            }, 
					styles: { position: "absolute" }, 
					preState: function() {  
						var from = {}, to = {};
			            var xy = this.get("node").getXY(), 
			                h = this.get("origHeight"),
			                w = this.get("origWidth"), 
			                nh = ((h / 2) + h), 
			                nw = ((w / 2) + w), 
			                nto = ((nh - h) / 2), 
			                nlo = ((nw - w) / 2),
			                nt = xy[1] - nto, 
			                nl = xy[0] - nlo;
			                
		                from.opacity = 1;
		                to.top = nt; to.left = nl;
		                to.width = nw; to.height = nh;
		                to.opacity = 0;
						
						return { from: from, to: to };
					}, 
					postState: function() { 
		                styleNode.call(this, { 
		                    height: this.get("origHeight") + "px", 
		                    width: this.get("origWidth") + "px", 
		                    top: this.get("origTop") + "px", 
		                    left: this.get("origLeft") + "px", 
		                    opacity: 1
		                }); 
						
						if(a) { a.call(this.get("node")); }
					}
				});
		    }, 
		    pagePuff: function(a) {
				perform.call(this, { 
					attributes: { 
		                origHeight: parseInt(this.get("node").getStyle("height")), 
		                origWidth: parseInt(this.get("node").getStyle("width")), 
		                origTop: parseInt(this.get("node").get("offsetTop")), 
		                origLeft: parseInt(this.get("node").get("offsetLeft"))
		            }, 
					styles: { position: "absolute" }, 
					preState: function() {  
						var from = {}, to = {};
			            var xy = this.get("node").getXY(), 
			                h = this.get("origHeight"),
			                w = this.get("origWidth"), 
			                nh = Y.DOM.winHeight(), //((Y.DOM.winHeight()/ 2) + h), 
			                nw = Y.DOM.winWidth(), //((Y.DOM.winWidth() / 2) + w), 
			                nto = ((nh - h) / 2), 
			                nlo = ((nw - w) / 2),
			                nt = xy[1] - nto, 
			                nl = xy[0] - nlo;
			                
		                from.opacity = 0;
		                to.top = 0; to.left = 0;
		                to.width = nw - 5; to.height = nh-5;
		                to.opacity = 1;
						
						return { from: from, to: to };
					}, 
					postState: function() { 
		                // styleNode.call(this, { 
		                    // height: this.get("origHeight") + "px", 
		                    // width: this.get("origWidth") + "px", 
		                    // top: this.get("origTop") + "px", 
		                    // left: this.get("origLeft") + "px", 
		                    // opacity: 1
		                // }); 
						
						if(a) { a.call(this.get("node")); }
					}
				});
		    }
	    };
	})();

	Y.extend(NodeAFX,Y.plugin.NodeFX,afx);
	Y.plugin.NodeAFX=NodeAFX;
	
}, '3.0.0pr2' ,{requires:['node', 'anim']});

