$.event.props = $.event.props.join('|').replace('layerX|layerY|', '').split('|');
$(window).bind("load", function(){
	
	//variables
		//This
			var thisElement = $('div.container');
			var documentHeight;
			var documentWidth;
			var keyPressed = false;
		//Content
			var content;
			var articles = {};
			var pageNumber = 1;
			var article	=	0;
			var articleTitles = {};
		//Column
			var columnWidth;
		//Settings
			var space	=	20;
			var lineHeight	=	25;
			var widthOfColumn = 280;
		
		//startup
		init();
		
		//-------------
		//	Statup, and reinitialize
		//-------------
		
		function init(){
			setArticles();
			flush();
			setLayers();
			setPages();
			gotoPage();
		}

		
		//-------------
		//  Flushing content
		//-------------
		
		function flush(){
			thisElement.empty();
		}
		
		//-------------
		//	Setting all the layout and layers
		//   - viewer
		//   - menu/button
		//   - toolbar
		//   - pageCounter
		//-------------
		
		function setLayers(){
			thisElement.html('<div class="viewer"><div class="status"></div></div><div class="sideMenu"><ul></ul></div><div class="menu"><ul><li id="bookmark">Bookmark</li></ul></div><div class="toolbar"><a href="#" class="button" id="menu">Menu</a><div class="pageCounter"></div></div>');
			// Setting height of the viewer
			$(".viewer").css("height", getDocHeight()-60+"px");
		}
		
		//-------------
		//  Gets all article tags and put it into an array
		//-------------
		
		function setArticles(){
			// Foreach the article tags
			thisElement.children().each(function(_, node) {
				articles[ _ ] = { };
				articles[ _ ]["data-cols"]		=	(node.getAttribute('data-cols') != null)?node.getAttribute('data-cols'):'3';
				articles[ _ ]["data-theme"]	=	(node.getAttribute('data-theme') != null)?node.getAttribute('data-theme'):'a';
				var count	=	0;
				var items	=	{ };
				var title;
				var titleFound	=	false;
				$(this).children().each(function(_, node) {
					if(node.nodeName != '#text' && node.innerHTML.trim() != ''){
						items[ count ] = { };
						items[ count ]["node"]			=	node.nodeName;
						items[ count ]["value"]			=	node.innerHTML;
						if(node.nodeName == "H1" && titleFound != true){
							title = node.textContent;
							titleFound = true;
						}
						count++;
					}
				});
				articles[ _ ]["title"]					=	title;
				articles[ _ ]["article"]				=	items;
			});
		}
		
		//-------------
		//	Setting the pages with its columns
		//-------------
		
		function setPages(){
			// Foreach all articles
			$.each(articles, function(key, value){
				var totalCounted		=	0;
				var elements			=	value["article"];
				var marge				=	0;
				articleTitles[key]		=	value["title"];
				
				// Current values
				var current				=	[];
				current["column"] 	=	1;
				current["page"]		=	0;
				current["element"]	=	-1;
				
				// Height of page
				var HM	=	(getDocHeight()-120)%lineHeight;
				var heightOfPage	=	(HM < lineHeight/2)
					?(getDocHeight()-120)-HM
					:(getDocHeight()-120)+(lineHeight-HM);	

				var done = false;
				var marginTop = 0;
				var lastItemHeight;
				
				
				// If determined number of columns does not fit onto the page it will recalculate the number of columns
				if(value["data-cols"]*(widthOfColumn+space) > getDocWidth())
				{
					var cols	=	Math.floor(getDocWidth()/(widthOfColumn+space));
					if(cols == 1){
						$(".sideMenu").hide();
					}
				}else{
					var cols	=	value["data-cols"];
				}

				
				do{
					// This makes the first page of an article
					if(current["page"] == 0){
						current["page"]++;
						$(".viewer", thisElement).append('<div class="page page-'+current["page"]+' theme-'+value["data-theme"]+' first" id="article_'+key+'" data-pageNumber="'+current["page"]+'" data-articleNumber="'+key+'" style="width: '+(widthOfColumn+space)+'px; height: '+heightOfPage+'px"><div class="column column_'+current["column"]+'" style="height: '+heightOfPage+'px"></div></div>');
					}
					
					// If needed it makes a new page					
					if(marge == 0){
						current["element"]++;
					}else{
						marginTop = lastItemHeight-marge;
						marge = 0;
					}
					
					
					
					// Removes headers if its shown half on a page (#1)
					var remove = false;
					if((heightOfPage-totalCounted) < (5*lineHeight) && heightOfPage-totalCounted > 0 && heightOfPage > 7*lineHeight){
						if(typeof(elements[current["element"]]) != 'undefined'){
							if(elements[current["element"]]["node"] == "H2"){
								totalCounted += heightOfPage-totalCounted;
								remove = true;
							}
						}
					}			
					// Check if all elements are done
					if(typeof(elements[current["element"]]) == 'undefined'){
						done = true;
						$(".page").hide();
						$(".first#article_0").show();
						$(".page-"+current["page"]+"#article_"+key).addClass("last");
						break;
					}
					
					if(elements[current["element"]]["node"] != "FIGURE"){
						// Place the content into the current pages/columns
						var iden = key+"_"+current["page"]+"_"+current["column"];
						$(".page-"+current["page"]+"#article_"+key+" .column_"+current["column"]).append('<'+elements[current["element"]]["node"]+' id="'+iden+'">'+elements[current["element"]]["value"]+'</'+elements[current["element"]]["node"]+'>');
						totalCounted += $("#"+iden).outerHeight(true);
					}else{
						//figure
						$(".page-"+current["page"]+"#article_"+key+" .column_"+current["column"]).append('<'+elements[current["element"]]["node"]+'>'+elements[current["element"]]["value"]+'</'+elements[current["element"]]["node"]+'>');
					}
					
					// Checks if item has to be removed (#1)
					if(remove){
						$("#"+iden).hide();
						remove = false;
					}
					
					// Use the margin on a element if there is any
					if(marginTop != 0){
						if(marginTop < 0){
							marginTop = 0;
						}
						if(current["column"] == (value["data-cols"]-1)){
							
						}
						totalCounted -= marginTop;
						$("#"+iden).css("marginTop", -marginTop+"px");
						marginTop = 0;
					}
					
					// Gets the height of the last placed element And removes the id attribute
					lastItemHeight	=	$("#"+iden).outerHeight();
					$("#"+iden).removeAttr("id");
					
					
					// Makes a new column
					if(totalCounted > heightOfPage){
						if(current["column"] >= cols){
							$(".page-"+current["page"]+"#article_"+key+" .column_"+current["column"]).addClass("last_column");
							current["page"]++;
							current["column"]		=	1;
							$(".viewer", thisElement).append('<div class="page page-'+current["page"]+' theme-'+value["data-theme"]+'" id="article_'+key+'" data-pageNumber="'+current["page"]+'" data-articleNumber="'+key+'" style="width: '+(widthOfColumn+space)+'px; height: '+heightOfPage+'px"></div>');
						}else{
							current["column"]++;
						}
						$(".page-"+current["page"]+"#article_"+key).append('<div class="column column_'+current["column"]+'" style="height: '+heightOfPage+'px"></div>');
						$(".page-"+current["page"]+"#article_"+key).width((widthOfColumn+space)*current["column"]);
						marge = (totalCounted-heightOfPage);
						totalCounted = 0;
					}
					
				}
				while(done != true);
				
			});
			afterLoading();
		}
		
		//-------------
		// After loading the document
		//-------------
		
		function afterLoading(){
			updatePageCounter();
		}
		
		//-------------
		//	When the window is resized it will call the function redo()
		//-------------
		
		var timeout = false;
		$(window).resize(function() {
			if (timeout === false) {
				timeout = true;
				setTimeout(redo, 300);
			}
		});
		
		//-------------
		//	Flushes all the content and reinitializes the document
		//-------------
		
		function redo(){
			flush();
			init();
			timeout = false;
		}
		
		
		//-------------
		//	Handeling all of the navigation with arrow keys
		//-------------
		
		$(document).keydown(function(e){
			// Left arrow
			if(e.keyCode == 37){
				prevPage();
				keyPressed	=	true;
			}
			// Right arrow
			if(e.keyCode == 39){
				nextPage();
				keyPressed	=	true;
			}
		});
		
		//-------------
		//	Handeling changing of the hash
		//-------------
		
		window.onhashchange = function()
		{
			if(keyPressed	!=	true){
				gotoPage();
			}else{
				keyPressed = false;
			}
		}
		
		//-------------
		//	Handeling all of the navigation with scrollWheel
		//-------------
		
		var pause = false;
		$('body').bind('mousewheel', function(e){
			if(pause == false){
				if(e.wheelDelta < 0) {
					nextPage();
				}else {
					prevPage();
				}
				pause = true;
				setTimeout(endPause, 300);
			}
			return false;
		});
		 
		function endPause(){
			pause = false;
		}
		
		//-------------
		//	Goes to the next page
		//-------------
		
		function nextPage(){
			if($(".page-"+(pageNumber+1)+"#article_"+article).is(':hidden'))
			{
				$(".page-"+pageNumber+"#article_"+article).hide();
				pageNumber++;
				$(".page-"+pageNumber+"#article_"+article).stop(true, true).fadeIn(500);
			}else if($(".page.first#article_"+(article+1)).is(':hidden')){
				$(".page-"+pageNumber+"#article_"+article).hide();
				article++;
				updateMenu();
				pageNumber = 1;
				$(".page.first#article_"+article).stop(true, true).fadeIn(500);
			}
			window.location = "#"+article+"/"+pageNumber;
			updatePageCounter();
		}
		
		//-------------
		//	Goes to the previous page
		//-------------
		
		function prevPage(){
			if(article == 0 && pageNumber == 1)
			{
				
			}else if(article == 0){
				$(".page-"+pageNumber+"#article_"+article).hide();
				pageNumber--;
				$(".page-"+pageNumber+"#article_"+article).stop(true, true).fadeIn(500);
			}else if(article > 0 && pageNumber == 1){
				$(".page-"+pageNumber+"#article_"+article).hide();
				article--;
				updateMenu();
				$(".page.last#article_"+article).fadeIn(500);
				pageNumber = $(".page.last#article_"+article).attr("data-pagenumber");
			}else if(article > 0){
				$(".page-"+pageNumber+"#article_"+article).hide();
				pageNumber--;
				$(".page-"+pageNumber+"#article_"+article).stop(true, true).fadeIn(500);
			}
			window.location = "#"+article+"/"+pageNumber;
			updatePageCounter();
		}
		
		//-------------
		//	Updates the pageCounter, number of pages and title of document
		//-------------
		
		function updatePageCounter(){
			$(".pageCounter").html(articleTitles[article]+" ("+pageNumber+" / "+parseInt(($("body").find("#article_"+article+":hidden").length)+1)+")");
			if(parseInt(($("body").find("#article_"+article+":hidden").length)+1) > 2){
				$(".status").stop(true, true).hide().css("width", (pageNumber/parseInt(($("body").find("#article_"+article+":hidden").length)+1))*100+"%").fadeIn(300);
			}else{
				$(".status").css("width", "0%");
			}
		}
		
		//-------------
		//	Goes to the current page
		//-------------
		
		function gotoPage(){
		//checks for hashes
			if(window.location.hash) {
				var hash		=	window.location.hash.substring(1).split('/');
				pageNumber	=	(hash[1] == undefined)?1:parseInt(hash[1]);
				article			=	parseInt(hash[0]);
				updatePageCounter();
			}
			
			$(".page").hide();
			if(!$(".page-"+pageNumber+"#article_"+article).is(':hidden'))
			{
				$(".page.last#article_"+article).show();
				pageNumber	=	parseInt($(".page.last#article_"+article).attr("data-pageNumber"));
				updatePageCounter();
			}else{
				$(".page-"+pageNumber+"#article_"+article).show();
			}
		}
		
		//-------------
		//	Handles the swipe gestures with TouchWipe
		//  http://archive.plugins.jquery.com/project/Touchwipe-iPhone-iPad-wipe-gesture
		//-------------
		
		$("body").touchwipe({
			 wipeLeft: function() { nextPage(); },
			 wipeRight: function() { prevPage(); },
			 wipeUp: function() {  },
			 wipeDown: function() {  },
			 min_move_x: 40,
			 min_move_y: 20,
			 preventDefaultEvents: true
		});
		
		//-------------
		//	Getting the windows height (for all browsers)
		//-------------
		
		function getDocHeight() {
			var D = document;
			return Math.max(
				Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
				Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
				Math.max(D.body.clientHeight, D.documentElement.clientHeight)
			);
		}
		
		//-------------
		//	Getting the windows width (for all browsers)
		//-------------
		
		function getDocWidth() {
			var D = document;
			return Math.max(
				Math.max(D.body.scrollWidth, D.documentElement.scrollWidth),
				Math.max(D.body.offsetWidth, D.documentElement.offsetWidth),
				Math.max(D.body.clientWidth, D.documentElement.clientWidth)
			);
		}
		
		//-------------
		//  Menu button opens the menu
		//-------------
		
		$("#menu").live('click', function(){
			$(".menu").slideToggle(200);
			return false;
		});
		
		$(".sideMenu").live('click', function(){
			$(".sideMenu").animate({left: 0}, 500);
			return false;
		});
		
		$('.sideMenu').live('click', function() {
			$('.sideMenu').toggle(function() {
				$(".sideMenu").animate({left: 0}, 500);
			},function(){
				$(".sideMenu").animate({left: -150}, 500);
			});
		});
		
		$.each(articles, function(key, value){
			$(".sideMenu ul").append('<li id="'+key+'">'+value["title"]+"</li>");
		});
		
		function updateMenu(){
			$(".sideMenu ul li").css("background", "none");
			$(".sideMenu ul li#"+article).css("background", "#ccc");
		}
});